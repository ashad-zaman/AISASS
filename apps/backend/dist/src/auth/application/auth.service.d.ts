import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../config/prisma.service';
import { RegisterInput, LoginInput, AuthTokens, User } from '../domain/entities';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService);
    register(input: RegisterInput): Promise<AuthTokens>;
    login(input: LoginInput): Promise<AuthTokens>;
    refresh(refreshToken: string): Promise<AuthTokens>;
    logout(userId: string): Promise<void>;
    private generateTokens;
    validateToken(token: string): Promise<User | null>;
}
