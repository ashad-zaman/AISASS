export declare class RegisterDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    tenantName?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class RefreshDto {
    refreshToken: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
}
