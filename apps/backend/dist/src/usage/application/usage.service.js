"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let UsageService = class UsageService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getUserUsage(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { tenant: true },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return this.getUsageStats(user.tenantId);
    }
    async getTenantUsage(tenantId) {
        return this.getUsageStats(tenantId);
    }
    async getUsageStats(tenantId) {
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
                used: (requests._sum.count || 0),
                limit: plan?.monthlyRequests || 100,
            },
            tokens: {
                used: (tokens._sum.tokens || 0),
                limit: plan?.monthlyTokens || 10000,
            },
            documents: {
                used: documents,
                limit: plan?.maxDocuments || 5,
            },
        };
    }
    async trackUsage(tenantId, userId, type, count = 1, tokens = 0) {
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
};
exports.UsageService = UsageService;
exports.UsageService = UsageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsageService);
//# sourceMappingURL=usage.service.js.map