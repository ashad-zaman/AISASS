import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RagService } from '../application/rag.service';
import { RagQueryDto, RagQueryResponseDto } from '../application/rag.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('RAG')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('query')
  @ApiOperation({ summary: 'Query documents using RAG' })
  async query(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RagQueryDto,
  ): Promise<RagQueryResponseDto> {
    return this.ragService.query(user.tenantId, dto);
  }
}