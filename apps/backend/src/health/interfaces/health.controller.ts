import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { PrismaService } from '../../config/prisma.service';

@ApiTags('Health')
@Controller()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get('health')
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({ status: 200, description: 'OK' })
  health(@Res() res: Response) {
    res.status(HttpStatus.OK).json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  @ApiResponse({ status: 200, description: 'Ready' })
  @ApiResponse({ status: 503, description: 'Not ready' })
  async ready(@Res() res: Response) {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      res.status(HttpStatus.OK).json({ 
        status: 'ready', 
        timestamp: new Date().toISOString(),
        services: { database: 'connected' }
      });
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({ 
        status: 'not ready', 
        error: 'Database not available'
      });
    }
  }
}