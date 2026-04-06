import { PrismaService } from '../../config/prisma.service';
export interface TenantResponse {
    id: string;
    name: string;
    slug: string;
    plan: string;
    settings: any;
    createdAt: Date;
}
export interface UpdateTenantInput {
    name?: string;
    settings?: any;
}
export declare class TenantsService {
    private prisma;
    constructor(prisma: PrismaService);
    getCurrentTenant(tenantId: string): Promise<TenantResponse>;
    updateTenant(tenantId: string, input: UpdateTenantInput): Promise<TenantResponse>;
    getTenantUsage(tenantId: string): Promise<any>;
}
