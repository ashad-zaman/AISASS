import { RawBodyRequest } from '@nestjs/common';
import { BillingService } from '../application/billing.service';
import { CheckoutSessionDto, CheckoutSessionResponseDto, WebhookResponseDto, SubscriptionDto } from '../application/billing.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
import { Request } from 'express';
export declare class BillingController {
    private readonly billingService;
    constructor(billingService: BillingService);
    createCheckoutSession(user: CurrentUserPayload, dto: CheckoutSessionDto): Promise<CheckoutSessionResponseDto>;
    handleWebhook(signature: string, req: RawBodyRequest<Request>): Promise<WebhookResponseDto>;
    getSubscription(user: CurrentUserPayload): Promise<SubscriptionDto | null>;
    cancelSubscription(user: CurrentUserPayload): Promise<void>;
}
