import { UsageService } from '../application/usage.service';
import { UsageResponseDto } from '../application/usage.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
export declare class UsageController {
    private readonly usageService;
    constructor(usageService: UsageService);
    getMyUsage(user: CurrentUserPayload): Promise<UsageResponseDto>;
    getTenantUsage(user: CurrentUserPayload): Promise<UsageResponseDto>;
}
