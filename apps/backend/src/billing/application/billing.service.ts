import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import Stripe from 'stripe';

export interface CheckoutSessionInput {
  planType: 'PRO' | 'TEAM';
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResponse {
  sessionId: string;
  url: string;
}

@Injectable()
export class BillingService {
  private stripe: Stripe;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.get<string>('stripe.secretKey') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createCheckoutSession(
    tenantId: string,
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResponse> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    let customerId = tenant.stripeCustomerId;

    if (!customerId) {
      const customer = await this.stripe.customers.create({
        metadata: { tenantId },
      });
      customerId = customer.id;

      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceId = input.planType === 'PRO'
      ? this.config.get<string>('stripe.priceIdPro')
      : this.config.get<string>('stripe.priceIdTeam');

    if (!priceId) {
      throw new BadRequestException('Plan not available');
    }

    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: { tenantId },
    });

    return {
      sessionId: session.id,
      url: session.url || '',
    };
  }

  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    const webhookSecret = this.config.get<string>('stripe.webhookSecret');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      throw new BadRequestException(`Webhook signature verification failed`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.handleCheckoutComplete(session);
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdate(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionDeleted(subscription);
        break;
      }
    }
  }

  private async handleCheckoutComplete(session: Stripe.Checkout.Session): Promise<void> {
    const tenantId = session.metadata?.tenantId;
    if (!tenantId) return;

    const subscription = await this.stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const planType = this.getPlanTypeFromPrice(subscription.items.data[0]?.price.id);
    const plan = await this.prisma.plan.findUnique({ where: { type: planType } });

    await this.prisma.subscription.upsert({
      where: { stripeSubscriptionId: subscription.id },
      create: {
        stripeSubscriptionId: subscription.id,
        stripeCustomerId: subscription.customer as string,
        status: 'ACTIVE',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        tenantId,
        planId: plan?.id || '',
      },
      update: {
        status: 'ACTIVE',
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        planId: plan?.id || '',
      },
    });

    await this.prisma.tenant.update({
      where: { id: tenantId },
      data: { plan: planType },
    });
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription): Promise<void> {
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: this.mapStripeStatus(subscription.status),
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      },
    });
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    await this.prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        status: 'CANCELED',
      },
    });

    const sub = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (sub) {
      await this.prisma.tenant.update({
        where: { id: sub.tenantId },
        data: { plan: 'FREE' },
      });
    }
  }

  private getPlanTypeFromPrice(priceId?: string): 'PRO' | 'TEAM' {
    const proPrice = this.config.get<string>('stripe.priceIdPro');
    const teamPrice = this.config.get<string>('stripe.priceIdTeam');
    
    if (priceId === proPrice) return 'PRO';
    if (priceId === teamPrice) return 'TEAM';
    return 'PRO';
  }

  private mapStripeStatus(status: string): 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'TRIALING' {
    switch (status) {
      case 'active': return 'ACTIVE';
      case 'canceled': return 'CANCELED';
      case 'past_due': return 'PAST_DUE';
      case 'trialing': return 'TRIALING';
      default: return 'ACTIVE';
    }
  }

  async getSubscription(tenantId: string): Promise<any> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: { not: 'CANCELED' } },
      include: { plan: true },
    });

    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      status: subscription.status,
      plan: subscription.plan.name,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }

  async cancelSubscription(tenantId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: { tenantId, status: 'ACTIVE' },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription');
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
    });
  }
}