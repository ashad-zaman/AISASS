import { UsersService } from '../application/users.service';
import { UpdateUserDto, UserResponseDto } from '../application/users.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(user: CurrentUserPayload): Promise<UserResponseDto>;
    updateMe(user: CurrentUserPayload, dto: UpdateUserDto): Promise<UserResponseDto>;
}
