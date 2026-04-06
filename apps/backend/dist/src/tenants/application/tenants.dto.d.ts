export declare class UpdateTenantDto {
    name?: string;
    settings?: Record<string, any>;
}
export declare class TenantResponseDto {
    id: string;
    name: string;
    slug: string;
    plan: string;
    settings: any;
    createdAt: Date;
}
export declare class TenantUsageDto {
    requests: {
        used: number;
        limit: number;
    };
    tokens: {
        used: number;
        limit: number;
    };
    documents: {
        used: number;
        limit: number;
    };
}
