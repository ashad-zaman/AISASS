import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RagQueryDto {
  @ApiProperty()
  @IsString()
  query: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  topK?: number;
}

export class SourceDto {
  @ApiProperty()
  documentId: string;

  @ApiProperty()
  filename: string;

  @ApiProperty()
  chunkId: string;

  @ApiProperty()
  content: string;
}

export class RagQueryResponseDto {
  @ApiProperty()
  answer: string;

  @ApiProperty({ type: [SourceDto] })
  sources: SourceDto[];
}