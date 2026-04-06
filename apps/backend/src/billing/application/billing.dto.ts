import { IsEnum, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutSessionDto {
  @ApiProperty({ enum: ['PRO', 'TEAM'] })
  @IsEnum(['PRO', 'TEAM'])
  planType: 'PRO' | 'TEAM';

  @ApiProperty()
  @IsUrl()
  successUrl: string;

  @ApiProperty()
  @IsUrl()
  cancelUrl: string;
}

export class CheckoutSessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  url: string;
}

export class WebhookResponseDto {
  @ApiProperty()
  received: boolean;
}

export class SubscriptionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  plan: string;

  @ApiProperty()
  currentPeriodEnd: Date;

  @ApiProperty()
  cancelAtPeriodEnd: boolean;
}