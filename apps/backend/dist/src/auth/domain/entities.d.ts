export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    emailVerified: boolean;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class RefreshToken {
    id: string;
    token: string;
    expiresAt: Date;
    revoked: boolean;
    userId: string;
    createdAt: Date;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface RegisterInput {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    tenantName?: string;
}
export interface LoginInput {
    email: string;
    password: string;
}
