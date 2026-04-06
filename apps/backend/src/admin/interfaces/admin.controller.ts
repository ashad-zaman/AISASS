import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from '../application/admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('OWNER', 'ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get system stats (admin only)' })
  async getStats() {
    return this.adminService.getStats();
  }

  @Get('failed-documents')
  @ApiOperation({ summary: 'Get failed documents' })
  async getFailedDocuments(@Query('limit') limit?: number) {
    return this.adminService.getFailedDocuments(limit || 10);
  }

  @Get('recent-jobs')
  @ApiOperation({ summary: 'Get recent jobs' })
  async getRecentJobs(@Query('limit') limit?: number) {
    return this.adminService.getRecentJobs(limit || 10);
  }

  @Get('tenants')
  @ApiOperation({ summary: 'List tenants' })
  async getTenants(
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.adminService.getTenants(limit || 50, offset || 0);
  }
}