import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  threadId?: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  model?: string;
}

export class ChatResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  threadId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  response: string;

  @ApiProperty()
  tokenUsage: number;

  @ApiProperty()
  model: string;
}

export class ThreadDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  model: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  messageCount: number;
}

export class MessageDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  role: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  tokenUsage: number;

  @ApiProperty()
  createdAt: Date;
}