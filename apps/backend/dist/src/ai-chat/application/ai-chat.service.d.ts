import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
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
export declare class AiChatService {
    private prisma;
    private config;
    private openai;
    private redis;
    constructor(prisma: PrismaService, config: ConfigService, redis: Redis);
    chat(userId: string, tenantId: string, request: ChatRequest): Promise<ChatResponse>;
    getThreads(tenantId: string, userId: string): Promise<any[]>;
    getThreadMessages(threadId: string, tenantId: string): Promise<any[]>;
}
