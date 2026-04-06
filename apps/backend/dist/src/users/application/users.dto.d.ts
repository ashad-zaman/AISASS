export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
}
export declare class UserResponseDto {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    tenantId: string;
    createdAt: Date;
}
