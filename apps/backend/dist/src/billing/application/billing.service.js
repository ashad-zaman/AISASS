"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../config/prisma.service");
const stripe_1 = require("stripe");
let BillingService = class BillingService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        this.stripe = new stripe_1.default(this.config.get('stripe.secretKey') || '', {
            apiVersion: '2023-10-16',
        });
    }
    async createCheckoutSession(tenantId, input) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
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
            ? this.config.get('stripe.priceIdPro')
            : this.config.get('stripe.priceIdTeam');
        if (!priceId) {
            throw new common_1.BadRequestException('Plan not available');
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
    async handleWebhook(payload, signature) {
        const webhookSecret = this.config.get('stripe.webhookSecret');
        if (!webhookSecret) {
            throw new common_1.BadRequestException('Webhook secret not configured');
        }
        let event;
        try {
            event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (err) {
            throw new common_1.BadRequestException(`Webhook signature verification failed`);
        }
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object;
                await this.handleCheckoutComplete(session);
                break;
            }
            case 'customer.subscription.updated': {
                const subscription = event.data.object;
                await this.handleSubscriptionUpdate(subscription);
                break;
            }
            case 'customer.subscription.deleted': {
                const subscription = event.data.object;
                await this.handleSubscriptionDeleted(subscription);
                break;
            }
        }
    }
    async handleCheckoutComplete(session) {
        const tenantId = session.metadata?.tenantId;
        if (!tenantId)
            return;
        const subscription = await this.stripe.subscriptions.retrieve(session.subscription);
        const planType = this.getPlanTypeFromPrice(subscription.items.data[0]?.price.id);
        const plan = await this.prisma.plan.findUnique({ where: { type: planType } });
        await this.prisma.subscription.upsert({
            where: { stripeSubscriptionId: subscription.id },
            create: {
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer,
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
    async handleSubscriptionUpdate(subscription) {
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
    async handleSubscriptionDeleted(subscription) {
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
    getPlanTypeFromPrice(priceId) {
        const proPrice = this.config.get('stripe.priceIdPro');
        const teamPrice = this.config.get('stripe.priceIdTeam');
        if (priceId === proPrice)
            return 'PRO';
        if (priceId === teamPrice)
            return 'TEAM';
        return 'PRO';
    }
    mapStripeStatus(status) {
        switch (status) {
            case 'active': return 'ACTIVE';
            case 'canceled': return 'CANCELED';
            case 'past_due': return 'PAST_DUE';
            case 'trialing': return 'TRIALING';
            default: return 'ACTIVE';
        }
    }
    async getSubscription(tenantId) {
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
    async cancelSubscription(tenantId) {
        const subscription = await this.prisma.subscription.findFirst({
            where: { tenantId, status: 'ACTIVE' },
        });
        if (!subscription) {
            throw new common_1.NotFoundException('No active subscription');
        }
        await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
        });
        await this.prisma.subscription.update({
            where: { id: subscription.id },
            data: { cancelAtPeriodEnd: true },
        });
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], BillingService);
//# sourceMappingURL=billing.service.js.map