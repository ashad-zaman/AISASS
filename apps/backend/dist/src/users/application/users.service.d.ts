import { PrismaService } from '../../config/prisma.service';
export interface UserResponse {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    tenantId: string;
    createdAt: Date;
}
export interface UpdateUserInput {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    getProfile(userId: string): Promise<UserResponse>;
    updateProfile(userId: string, input: UpdateUserInput): Promise<UserResponse>;
}
