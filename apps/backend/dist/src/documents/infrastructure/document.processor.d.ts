import { Job } from 'bullmq';
import { RagService } from '../../rag/application/rag.service';
interface DocumentProcessingJob {
    documentId: string;
    tenantId: string;
}
export declare class DocumentProcessor {
    private ragService;
    private readonly logger;
    constructor(ragService: RagService);
    processDocument(job: Job<DocumentProcessingJob>): Promise<void>;
}
export {};
