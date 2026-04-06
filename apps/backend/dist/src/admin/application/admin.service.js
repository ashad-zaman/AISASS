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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../config/prisma.service");
let AdminService = class AdminService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
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
            totalRequests: (usage._sum.count || 0),
            failedDocuments: failedDocs,
            activeSubscriptions: subscriptions,
        };
    }
    async getFailedDocuments(limit = 10) {
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
        });
    }
    async getRecentJobs(limit = 10) {
        return [];
    }
    async getTenants(limit = 50, offset = 0) {
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map