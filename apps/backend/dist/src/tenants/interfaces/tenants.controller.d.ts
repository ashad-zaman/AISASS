import { TenantsService } from '../application/tenants.service';
import { UpdateTenantDto, TenantResponseDto, TenantUsageDto } from '../application/tenants.dto';
import { CurrentUserPayload } from '../../common/decorators/current-user.decorator';
export declare class TenantsController {
    private readonly tenantsService;
    constructor(tenantsService: TenantsService);
    getCurrent(user: CurrentUserPayload): Promise<TenantResponseDto>;
    updateCurrent(user: CurrentUserPayload, dto: UpdateTenantDto): Promise<TenantResponseDto>;
    getUsage(user: CurrentUserPayload): Promise<TenantUsageDto>;
}
