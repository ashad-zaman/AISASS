import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsageService } from '../application/usage.service';
import { UsageResponseDto } from '../application/usage.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('Usage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user usage' })
  async getMyUsage(@CurrentUser() user: CurrentUserPayload): Promise<UsageResponseDto> {
    return this.usageService.getUserUsage(user.id);
  }

  @Get('tenant')
  @ApiOperation({ summary: 'Get tenant usage' })
  async getTenantUsage(@CurrentUser() user: CurrentUserPayload): Promise<UsageResponseDto> {
    return this.usageService.getTenantUsage(user.tenantId);
  }
}