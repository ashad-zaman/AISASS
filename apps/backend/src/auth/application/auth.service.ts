import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../config/prisma.service';
import { RegisterInput, LoginInput, AuthTokens, User } from '../domain/entities';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async register(input: RegisterInput): Promise<AuthTokens> {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error('Email already registered');
    }

    const tenantSlug = input.tenantName?.toLowerCase().replace(/\s+/g, '-') || 
      `tenant-${uuidv4().slice(0, 8)}`;
    
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

  async login(input: LoginInput): Promise<AuthTokens> {
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

  async refresh(refreshToken: string): Promise<AuthTokens> {
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

  async logout(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }

  private async generateTokens(userId: string, email: string, tenantId: string): Promise<AuthTokens> {
    const payload = { sub: userId, email, tenantId };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn') || '15m',
    });

    const refreshToken = randomUUID();
    const expiresIn = this.config.get<string>('jwt.refreshExpiresIn') || '7d';
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

  async validateToken(token: string): Promise<User | null> {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.config.get<string>('jwt.secret'),
      });
      
      return this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: { memberships: { include: { tenant: true } } },
      }) as Promise<User | null>;
    } catch {
      return null;
    }
  }
}