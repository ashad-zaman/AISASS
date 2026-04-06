"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiChatService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../config/prisma.service");
const openai_1 = require("openai");
const ioredis_1 = require("ioredis");
let AiChatService = class AiChatService {
    constructor(prisma, config, redis) {
        this.prisma = prisma;
        this.config = config;
        this.openai = new openai_1.OpenAI({
            apiKey: config.get('openai.apiKey'),
        });
        this.redis = redis;
    }
    async chat(userId, tenantId, request) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const plan = await this.prisma.plan.findUnique({ where: { type: tenant?.plan || 'FREE' } });
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const usage = await this.prisma.usageLog.aggregate({
            where: { tenantId, type: 'chat', createdAt: { gte: startOfMonth } },
            _sum: { count: true, tokens: true },
        });
        if (plan && (usage._sum.count || 0) >= plan.monthlyRequests) {
            throw new common_1.ForbiddenException('Monthly request limit exceeded');
        }
        let thread;
        if (request.threadId) {
            thread = await this.prisma.aiThread.findFirst({
                where: { id: request.threadId, tenantId },
                include: { messages: { orderBy: { createdAt: 'asc' } } },
            });
            if (!thread) {
                throw new common_1.BadRequestException('Thread not found');
            }
        }
        else {
            thread = await this.prisma.aiThread.create({
                data: {
                    title: request.message.slice(0, 50),
                    tenantId,
                    userId,
                    model: request.model || this.config.get('openai.model'),
                    systemPrompt: request.systemPrompt,
                },
                include: { messages: { orderBy: { createdAt: 'asc' } } },
            });
        }
        const messages = [];
        if (thread.systemPrompt) {
            messages.push({ role: 'system', content: thread.systemPrompt });
        }
        messages.push(...thread.messages.map((m) => ({ role: m.role, content: m.content })));
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
            messages: messages,
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
    async getThreads(tenantId, userId) {
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
    async getThreadMessages(threadId, tenantId) {
        const thread = await this.prisma.aiThread.findFirst({
            where: { id: threadId, tenantId },
        });
        if (!thread) {
            throw new common_1.BadRequestException('Thread not found');
        }
        return this.prisma.aiMessage.findMany({
            where: { threadId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.AiChatService = AiChatService;
exports.AiChatService = AiChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        ioredis_1.Redis])
], AiChatService);
//# sourceMappingURL=ai-chat.service.js.map