import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from '../application/tenants.service';
import { UpdateTenantDto, TenantResponseDto, TenantUsageDto } from '../application/tenants.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Get('current')
  @ApiOperation({ summary: 'Get current tenant' })
  async getCurrent(@CurrentUser() user: CurrentUserPayload): Promise<TenantResponseDto> {
    return this.tenantsService.getCurrentTenant(user.tenantId);
  }

  @Patch('current')
  @ApiOperation({ summary: 'Update current tenant' })
  async updateCurrent(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateTenantDto,
  ): Promise<TenantResponseDto> {
    return this.tenantsService.updateTenant(user.tenantId, dto);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get tenant usage stats' })
  async getUsage(@CurrentUser() user: CurrentUserPayload): Promise<TenantUsageDto> {
    return this.tenantsService.getTenantUsage(user.tenantId);
  }
}