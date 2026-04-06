import { PrismaService } from '../../config/prisma.service';
export interface UsageStats {
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
export declare class UsageService {
    private prisma;
    constructor(prisma: PrismaService);
    getUserUsage(userId: string): Promise<UsageStats>;
    getTenantUsage(tenantId: string): Promise<UsageStats>;
    private getUsageStats;
    trackUsage(tenantId: string, userId: string, type: string, count?: number, tokens?: number): Promise<void>;
}
