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
exports.TenantsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let TenantsService = class TenantsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCurrentTenant(tenantId) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });
        if (!tenant) {
            throw new common_1.NotFoundException('Tenant not found');
        }
        return tenant;
    }
    async updateTenant(tenantId, input) {
        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                ...(input.name && { name: input.name }),
                ...(input.settings && { settings: input.settings }),
            },
        });
    }
    async getTenantUsage(tenantId) {
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
};
exports.TenantsService = TenantsService;
exports.TenantsService = TenantsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TenantsService);
//# sourceMappingURL=tenants.service.js.map