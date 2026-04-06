export declare class CheckoutSessionDto {
    planType: 'PRO' | 'TEAM';
    successUrl: string;
    cancelUrl: string;
}
export declare class CheckoutSessionResponseDto {
    sessionId: string;
    url: string;
}
export declare class WebhookResponseDto {
    received: boolean;
}
export declare class SubscriptionDto {
    id: string;
    status: string;
    plan: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
}
