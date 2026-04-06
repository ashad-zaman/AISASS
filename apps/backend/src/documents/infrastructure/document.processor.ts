import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RagService } from '../../rag/application/rag.service';

interface DocumentProcessingJob {
  documentId: string;
  tenantId: string;
}

@Injectable()
export class DocumentProcessor {
  private readonly logger = new Logger(DocumentProcessor.name);

  constructor(private ragService: RagService) {}

  async processDocument(job: Job<DocumentProcessingJob>): Promise<void> {
    const { documentId, tenantId } = job.data;
    this.logger.log(`Processing document ${documentId} for tenant ${tenantId}`);

    try {
      await this.ragService.processDocument(documentId);
      this.logger.log(`Successfully processed document ${documentId}`);
    } catch (error) {
      this.logger.error(`Failed to process document ${documentId}`, error);
      throw error;
    }
  }
}