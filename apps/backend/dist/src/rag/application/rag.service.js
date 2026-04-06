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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RagService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../config/prisma.service");
const storage_service_1 = require("../../common/services/storage.service");
const queue_service_1 = require("../../common/services/queue.service");
const openai_1 = require("openai");
let RagService = class RagService {
    constructor(prisma, config, storageService, queueService) {
        this.prisma = prisma;
        this.config = config;
        this.storageService = storageService;
        this.queueService = queueService;
        this.openai = new openai_1.OpenAI({
            apiKey: config.get('openai.apiKey'),
        });
    }
    async processDocument(documentId) {
        const document = await this.prisma.document.findUnique({ where: { id: documentId } });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        try {
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'PROCESSING' },
            });
            const buffer = await this.storageService.download(document.storageKey);
            const text = buffer.toString('utf-8');
            const chunks = this.chunkText(text, 1000, 100);
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const embedding = await this.generateEmbedding(chunk);
                await this.prisma.documentChunk.create({
                    data: {
                        documentId,
                        content: chunk,
                        sequence: i,
                        metadata: { start: i * 1000, end: (i + 1) * 1000 },
                    },
                });
            }
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'INDEXED' },
            });
        }
        catch (error) {
            await this.prisma.document.update({
                where: { id: documentId },
                data: { status: 'FAILED', error: error.message },
            });
            throw error;
        }
    }
    chunkText(content, chunkSize = 1000, overlap = 100) {
        const chunks = [];
        let start = 0;
        while (start < content.length) {
            const end = Math.min(start + chunkSize, content.length);
            chunks.push(content.slice(start, end));
            start += chunkSize - overlap;
        }
        return chunks;
    }
    async generateEmbedding(text) {
        const response = await this.openai.embeddings.create({
            model: this.config.get('openai.embeddingModel') || 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    }
    async query(tenantId, input) {
        const queryEmbedding = await this.generateEmbedding(input.query);
        const topK = input.topK || 5;
        const chunks = await this.prisma.documentChunk.findMany({
            where: { document: { tenantId, status: 'INDEXED' } },
            take: topK * 2,
            orderBy: { content: 'asc' },
        });
        const results = [];
        for (const chunk of chunks) {
            const similarity = this.cosineSimilarity(queryEmbedding, await this.generateEmbedding(chunk.content));
            results.push({
                chunkId: chunk.id,
                content: chunk.content,
                documentId: chunk.documentId,
                filename: '',
                score: similarity,
            });
        }
        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, topK);
        for (const result of topResults) {
            const doc = await this.prisma.document.findUnique({ where: { id: result.documentId } });
            result.filename = doc?.originalName || '';
        }
        const context = topResults.map(r => r.content).join('\n\n');
        const systemPrompt = `You are a helpful assistant. Use the following context to answer the user's question.\n\nContext:\n${context}`;
        const completion = await this.openai.chat.completions.create({
            model: this.config.get('openai.model') || 'gpt-4-turbo-preview',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: input.query },
            ],
            temperature: 0.7,
        });
        return {
            answer: completion.choices[0]?.message?.content || '',
            sources: topResults.map(r => ({
                documentId: r.documentId,
                filename: r.filename,
                chunkId: r.chunkId,
                content: r.content.slice(0, 200),
            })),
        };
    }
    cosineSimilarity(a, b) {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magA * magB);
    }
};
exports.RagService = RagService;
exports.RagService = RagService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        storage_service_1.StorageService,
        queue_service_1.QueueService])
], RagService);
//# sourceMappingURL=rag.service.js.map