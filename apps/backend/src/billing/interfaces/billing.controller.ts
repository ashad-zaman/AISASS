import { Controller, Post, Get, Body, Headers, RawBodyRequest, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillingService } from '../application/billing.service';
import { CheckoutSessionDto, CheckoutSessionResponseDto, WebhookResponseDto, SubscriptionDto } from '../application/billing.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Billing')
@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create Stripe checkout session' })
  async createCheckoutSession(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    return this.billingService.createCheckoutSession(user.tenantId, dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ): Promise<WebhookResponseDto> {
    const payload = req.rawBody;
    if (!payload) {
      throw new Error('No payload');
    }
    await this.billingService.handleWebhook(payload, signature);
    return { received: true };
  }

  @Get('subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current subscription' })
  async getSubscription(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<SubscriptionDto | null> {
    return this.billingService.getSubscription(user.tenantId);
  }

  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  async cancelSubscription(
    @CurrentUser() user: CurrentUserPayload,
  ): Promise<void> {
    return this.billingService.cancelSubscription(user.tenantId);
  }
}