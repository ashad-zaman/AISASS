import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
export interface CheckoutSessionInput {
    planType: 'PRO' | 'TEAM';
    successUrl: string;
    cancelUrl: string;
}
export interface CheckoutSessionResponse {
    sessionId: string;
    url: string;
}
export declare class BillingService {
    private prisma;
    private config;
    private stripe;
    constructor(prisma: PrismaService, config: ConfigService);
    createCheckoutSession(tenantId: string, input: CheckoutSessionInput): Promise<CheckoutSessionResponse>;
    handleWebhook(payload: Buffer, signature: string): Promise<void>;
    private handleCheckoutComplete;
    private handleSubscriptionUpdate;
    private handleSubscriptionDeleted;
    private getPlanTypeFromPrice;
    private mapStripeStatus;
    getSubscription(tenantId: string): Promise<any>;
    cancelSubscription(tenantId: string): Promise<void>;
}
