import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { QueueService } from '../../common/services/queue.service';
export interface UploadDocumentInput {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    buffer: Buffer;
}
export interface DocumentResponse {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    status: string;
    error?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare class DocumentsService {
    private prisma;
    private config;
    private storageService;
    private queueService;
    constructor(prisma: PrismaService, config: ConfigService, storageService: StorageService, queueService: QueueService);
    upload(userId: string, tenantId: string, input: UploadDocumentInput): Promise<DocumentResponse>;
    list(tenantId: string): Promise<DocumentResponse[]>;
    get(documentId: string, tenantId: string): Promise<DocumentResponse>;
    delete(documentId: string, tenantId: string): Promise<void>;
}
