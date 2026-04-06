import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTenantDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class TenantResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  plan: string;

  @ApiProperty()
  settings: any;

  @ApiProperty()
  createdAt: Date;
}

export class TenantUsageDto {
  requests: { used: number; limit: number };
  tokens: { used: number; limit: number };
  documents: { used: number; limit: number };
}