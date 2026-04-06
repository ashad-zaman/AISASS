import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiChatService } from '../application/ai-chat.service';
import { ChatRequestDto, ChatResponseDto, ThreadDto, MessageDto } from '../application/ai-chat.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserPayload } from '../../common/decorators/current-user.decorator';

@ApiTags('AI Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Send a chat message' })
  async chat(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ChatRequestDto,
  ): Promise<ChatResponseDto> {
    return this.aiChatService.chat(user.id, user.tenantId, dto);
  }

  @Get('threads')
  @ApiOperation({ summary: 'List chat threads' })
  async listThreads(@CurrentUser() user: CurrentUserPayload): Promise<ThreadDto[]> {
    const threads = await this.aiChatService.getThreads(user.tenantId, user.id);
    return threads.map(t => ({
      id: t.id,
      title: t.title,
      model: t.model,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      messageCount: t._count.messages,
    }));
  }

  @Get('threads/:id/messages')
  @ApiOperation({ summary: 'Get thread messages' })
  async getMessages(
    @CurrentUser() user: CurrentUserPayload,
    @Param('id') threadId: string,
  ): Promise<MessageDto[]> {
    const messages = await this.aiChatService.getThreadMessages(threadId, user.tenantId);
    return messages.map(m => ({
      id: m.id,
      role: m.role,
      content: m.content,
      tokenUsage: m.tokenUsage,
      createdAt: m.createdAt,
    }));
  }
}