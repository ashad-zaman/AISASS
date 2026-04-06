import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { QueueService } from '../../common/services/queue.service';
export interface ChunkTextInput {
    content: string;
    chunkSize?: number;
    overlap?: number;
}
export interface RetrievalResult {
    chunkId: string;
    content: string;
    documentId: string;
    filename: string;
    score: number;
}
export interface RagQueryInput {
    query: string;
    topK?: number;
}
export interface RagQueryResponse {
    answer: string;
    sources: {
        documentId: string;
        filename: string;
        chunkId: string;
        content: string;
    }[];
}
export declare class RagService {
    private prisma;
    private config;
    private storageService;
    private queueService;
    private openai;
    constructor(prisma: PrismaService, config: ConfigService, storageService: StorageService, queueService: QueueService);
    processDocument(documentId: string): Promise<void>;
    chunkText(content: string, chunkSize?: number, overlap?: number): string[];
    generateEmbedding(text: string): Promise<number[]>;
    query(tenantId: string, input: RagQueryInput): Promise<RagQueryResponse>;
    private cosineSimilarity;
}
