import { ApiProperty } from '@nestjs/swagger';

export class UsageStatDto {
  @ApiProperty()
  used: number;

  @ApiProperty()
  limit: number;
}

export class UsageResponseDto {
  @ApiProperty()
  requests: UsageStatDto;

  @ApiProperty()
  tokens: UsageStatDto;

  @ApiProperty()
  documents: UsageStatDto;
}