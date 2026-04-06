import { AuthService } from '../application/auth.service';
import { RegisterDto, LoginDto, RefreshDto, AuthResponseDto } from '../application/auth.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<AuthResponseDto>;
    login(dto: LoginDto): Promise<AuthResponseDto>;
    refresh(dto: RefreshDto): Promise<AuthResponseDto>;
    logout(user: CurrentUserPayload): Promise<void>;
}
