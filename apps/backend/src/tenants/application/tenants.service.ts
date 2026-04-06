import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async getCurrentTenant(tenantId: string): Promise<TenantResponse> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async updateTenant(tenantId: string, input: UpdateTenantInput): Promise<TenantResponse> {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.settings && { settings: input.settings }),
      },
    });
  }

  async getTenantUsage(tenantId: string): Promise<any> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [requests, tokens, documents] = await Promise.all([
      this.prisma.usageLog.aggregate({
        where: { tenantId, createdAt: { gte: startOfMonth } },
        _sum: { count: true },
      }),
      this.prisma.usageLog.aggregate({
        where: { tenantId, createdAt: { gte: startOfMonth } },
        _sum: { tokens: true },
      }),
      this.prisma.document.count({
        where: { tenantId },
      }),
    ]);

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const plan = await this.prisma.plan.findUnique({ where: { type: tenant?.plan || 'FREE' } });

    return {
      requests: {
        used: requests._sum.count || 0,
        limit: plan?.monthlyRequests || 100,
      },
      tokens: {
        used: tokens._sum.tokens || 0,
        limit: plan?.monthlyTokens || 10000,
      },
      documents: {
        used: documents,
        limit: plan?.maxDocuments || 5,
      },
    };
  }
}