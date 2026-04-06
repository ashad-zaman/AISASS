import { Injectable, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { OpenAI } from 'openai';
import { Redis } from 'ioredis';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  threadId?: string;
  message: string;
  systemPrompt?: string;
  model?: string;
}

export interface ChatResponse {
  id: string;
  threadId: string;
  message: string;
  response: string;
  tokenUsage: number;
  model: string;
}

@Injectable()
export class AiChatService {
  private openai: OpenAI;
  private redis: Redis;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    @Inject('REDIS_CLIENT') redis: Redis,
  ) {
    this.openai = new OpenAI({
      apiKey: config.get<string>('openai.apiKey'),
    });
    this.redis = redis;
  }

  async chat(userId: string, tenantId: string, request: ChatRequest): Promise<ChatResponse> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const plan = await this.prisma.plan.findUnique({ where: { type: tenant?.plan || 'FREE' } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const usage = await this.prisma.usageLog.aggregate({
      where: { tenantId, type: 'chat', createdAt: { gte: startOfMonth } },
      _sum: { count: true, tokens: true },
    });

    if (plan && (usage._sum.count || 0) >= plan.monthlyRequests) {
      throw new ForbiddenException('Monthly request limit exceeded');
    }

    let thread;
    if (request.threadId) {
      thread = await this.prisma.aiThread.findFirst({
        where: { id: request.threadId, tenantId },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      if (!thread) {
        throw new BadRequestException('Thread not found');
      }
    } else {
      thread = await this.prisma.aiThread.create({
        data: {
          title: request.message.slice(0, 50),
          tenantId,
          userId,
          model: request.model || this.config.get<string>('openai.model'),
          systemPrompt: request.systemPrompt,
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
    }

    const messages: ChatMessage[] = [];
    if (thread.systemPrompt) {
      messages.push({ role: 'system', content: thread.systemPrompt });
    }
    messages.push(...thread.messages.map((m: any) => ({ role: m.role as any, content: m.content })));
    messages.push({ role: 'user', content: request.message });

    const cacheKey = `chat:${tenantId}:${Buffer.from(JSON.stringify(messages)).toString('base64').slice(0, 50)}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      await this.prisma.aiMessage.create({
        data: {
          threadId: thread.id,
          userId,
          role: 'user',
          content: request.message,
          model: thread.model,
        },
      });
      await this.prisma.aiMessage.create({
        data: {
          threadId: thread.id,
          userId,
          role: 'assistant',
          content: parsed.response,
          tokenUsage: parsed.tokenUsage,
          model: thread.model,
        },
      });
      return { id: parsed.id, threadId: thread.id, message: request.message, response: parsed.response, tokenUsage: parsed.tokenUsage, model: thread.model };
    }

    const completion = await this.openai.chat.completions.create({
      model: thread.model,
      messages: messages as any,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content || '';
    const tokenUsage = completion.usage?.total_tokens || 0;

    await this.prisma.aiMessage.create({
      data: {
        threadId: thread.id,
        userId,
        role: 'user',
        content: request.message,
        model: thread.model,
      },
    });

    const assistantMessage = await this.prisma.aiMessage.create({
      data: {
        threadId: thread.id,
        userId,
        role: 'assistant',
        content: response,
        tokenUsage,
        model: thread.model,
      },
    });

    await this.prisma.usageLog.create({
      data: {
        tenantId,
        userId,
        type: 'chat',
        count: 1,
        tokens: tokenUsage,
      },
    });

    const responseToCache = { id: assistantMessage.id, response, tokenUsage };
    await this.redis.set(cacheKey, JSON.stringify(responseToCache), 'EX', 3600);

    return {
      id: assistantMessage.id,
      threadId: thread.id,
      message: request.message,
      response,
      tokenUsage,
      model: thread.model,
    };
  }

  async getThreads(tenantId: string, userId: string): Promise<any[]> {
    return this.prisma.aiThread.findMany({
      where: { tenantId, userId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        model: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { messages: true } },
      },
    });
  }

  async getThreadMessages(threadId: string, tenantId: string): Promise<any[]> {
    const thread = await this.prisma.aiThread.findFirst({
      where: { id: threadId, tenantId },
    });
    if (!thread) {
      throw new BadRequestException('Thread not found');
    }
    return this.prisma.aiMessage.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' },
    });
  }
}