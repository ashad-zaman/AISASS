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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const crypto_1 = require("crypto");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../config/prisma.service");
const uuid_1 = require("uuid");
let AuthService = class AuthService {
    constructor(prisma, jwtService, config) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
    }
    async register(input) {
        const existing = await this.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (existing) {
            throw new Error('Email already registered');
        }
        const tenantSlug = input.tenantName?.toLowerCase().replace(/\s+/g, '-') ||
            `tenant-${(0, uuid_1.v4)().slice(0, 8)}`;
        const passwordHash = await bcrypt.hash(input.password, 12);
        const tenant = await this.prisma.tenant.create({
            data: {
                name: input.tenantName || 'My Workspace',
                slug: tenantSlug,
                plan: 'FREE',
            },
        });
        const user = await this.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                firstName: input.firstName,
                lastName: input.lastName,
                tenantId: tenant.id,
            },
        });
        await this.prisma.tenantMembership.create({
            data: {
                userId: user.id,
                tenantId: tenant.id,
                role: 'OWNER',
            },
        });
        const freePlan = await this.prisma.plan.findUnique({ where: { type: 'FREE' } });
        if (!freePlan) {
            await this.prisma.plan.create({
                data: {
                    name: 'Free',
                    type: 'FREE',
                    monthlyPrice: 0,
                    yearlyPrice: 0,
                    monthlyRequests: 100,
                    monthlyTokens: 10000,
                    maxDocuments: 5,
                    maxFileSize: 5242880,
                    maxMembers: 1,
                    features: JSON.stringify(['Basic chat', '5 documents', '10k tokens/month']),
                },
            });
        }
        return this.generateTokens(user.id, user.email, tenant.id);
    }
    async login(input) {
        const user = await this.prisma.user.findUnique({
            where: { email: input.email },
            include: { memberships: { include: { tenant: true } } },
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const valid = await bcrypt.compare(input.password, user.passwordHash);
        if (!valid) {
            throw new Error('Invalid credentials');
        }
        const tenant = user.memberships[0]?.tenant;
        return this.generateTokens(user.id, user.email, tenant?.id || '');
    }
    async refresh(refreshToken) {
        const token = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: { include: { memberships: { include: { tenant: true } } } } },
        });
        if (!token || token.revoked || token.expiresAt < new Date()) {
            throw new Error('Invalid refresh token');
        }
        const tenant = token.user.memberships[0]?.tenant;
        return this.generateTokens(token.user.id, token.user.email, tenant?.id || '');
    }
    async logout(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revoked: false },
            data: { revoked: true },
        });
    }
    async generateTokens(userId, email, tenantId) {
        const payload = { sub: userId, email, tenantId };
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get('jwt.secret'),
            expiresIn: this.config.get('jwt.expiresIn') || '15m',
        });
        const refreshToken = (0, crypto_1.randomUUID)();
        const expiresIn = this.config.get('jwt.refreshExpiresIn') || '7d';
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.prisma.refreshToken.create({
            data: {
                token: refreshToken,
                expiresAt,
                userId,
            },
        });
        return { accessToken, refreshToken };
    }
    async validateToken(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.config.get('jwt.secret'),
            });
            return this.prisma.user.findUnique({
                where: { id: payload.sub },
                include: { memberships: { include: { tenant: true } } },
            });
        }
        catch {
            return null;
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map