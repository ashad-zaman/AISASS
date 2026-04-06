import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface UsageStats {
  requests: { used: number; limit: number };
  tokens: { used: number; limit: number };
  documents: { used: number; limit: number };
}

@Injectable()
export class UsageService {
  constructor(private prisma: PrismaService) {}

  async getUserUsage(userId: string): Promise<UsageStats> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { tenant: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return this.getUsageStats(user.tenantId);
  }

  async getTenantUsage(tenantId: string): Promise<UsageStats> {
    return this.getUsageStats(tenantId);
  }

  private async getUsageStats(tenantId: string): Promise<UsageStats> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const plan = await this.prisma.plan.findUnique({ where: { type: tenant?.plan || 'FREE' } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [requests, tokens, documents] = await Promise.all([
      this.prisma.usageLog.aggregate({
        where: { tenantId, type: 'chat', createdAt: { gte: startOfMonth } },
        _sum: { count: true },
      }),
      this.prisma.usageLog.aggregate({
        where: { tenantId, createdAt: { gte: startOfMonth } },
        _sum: { tokens: true },
      }),
      this.prisma.document.count({
        where: { tenantId, createdAt: { gte: startOfMonth } },
      }),
    ]);

    return {
      requests: {
        used: (requests._sum.count || 0) as number,
        limit: plan?.monthlyRequests || 100,
      },
      tokens: {
        used: (tokens._sum.tokens || 0) as number,
        limit: plan?.monthlyTokens || 10000,
      },
      documents: {
        used: documents,
        limit: plan?.maxDocuments || 5,
      },
    };
  }

  async trackUsage(
    tenantId: string,
    userId: string,
    type: string,
    count: number = 1,
    tokens: number = 0,
  ): Promise<void> {
    await this.prisma.usageLog.create({
      data: {
        tenantId,
        userId,
        type,
        count,
        tokens,
      },
    });
  }
}