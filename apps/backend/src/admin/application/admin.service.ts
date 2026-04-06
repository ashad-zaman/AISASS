import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getStats(): Promise<AdminStats> {
    const [tenants, users, documents, failedDocs, subscriptions] = await Promise.all([
      this.prisma.tenant.count(),
      this.prisma.user.count(),
      this.prisma.document.count(),
      this.prisma.document.count({ where: { status: 'FAILED' } }),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    ]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usage = await this.prisma.usageLog.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _sum: { count: true },
    });

    return {
      totalTenants: tenants,
      totalUsers: users,
      totalDocuments: documents,
      totalRequests: (usage._sum.count || 0) as number,
      failedDocuments: failedDocs,
      activeSubscriptions: subscriptions,
    };
  }

  async getFailedDocuments(limit: number = 10): Promise<FailedJob[]> {
    return this.prisma.document.findMany({
      where: { status: 'FAILED' },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        filename: true,
        error: true,
        updatedAt: true,
      },
    }) as any;
  }

  async getRecentJobs(limit: number = 10): Promise<any[]> {
    return [];
  }

  async getTenants(limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.prisma.tenant.findMany({
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { users: true, documents: true } },
        subscriptions: { where: { status: 'ACTIVE' } },
      },
    });
  }
}