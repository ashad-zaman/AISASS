import { PrismaService } from '../../config/prisma.service';
export interface AdminStats {
    totalTenants: number;
    totalUsers: number;
    totalDocuments: number;
    totalRequests: number;
    failedDocuments: number;
    activeSubscriptions: number;
}
export interface FailedJob {
    id: string;
    name: string;
    error: string;
    attempts: number;
    createdAt: Date;
}
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<AdminStats>;
    getFailedDocuments(limit?: number): Promise<FailedJob[]>;
    getRecentJobs(limit?: number): Promise<any[]>;
    getTenants(limit?: number, offset?: number): Promise<any[]>;
}
