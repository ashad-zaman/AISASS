import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
export declare class JwtAuthGuard implements CanActivate {
    private jwtService;
    private config;
    private prisma;
    constructor(jwtService: JwtService, config: ConfigService, prisma: PrismaService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private extractTokenFromHeader;
}
