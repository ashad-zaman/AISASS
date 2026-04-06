import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
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

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private storageService: StorageService,
    private queueService: QueueService,
  ) {}

  async upload(
    userId: string,
    tenantId: string,
    input: UploadDocumentInput,
  ): Promise<DocumentResponse> {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    const plan = await this.prisma.plan.findUnique({ where: { type: tenant?.plan || 'FREE' } });

    const docCount = await this.prisma.document.count({ where: { tenantId } });
    if (plan && docCount >= plan.maxDocuments) {
      throw new ForbiddenException('Document limit exceeded');
    }

    if (plan && input.size > plan.maxFileSize) {
      throw new ForbiddenException('File size exceeds plan limit');
    }

    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'];
    if (!allowedTypes.includes(input.mimeType)) {
      throw new BadRequestException('File type not allowed');
    }

    const storageKey = await this.storageService.upload(input.buffer, input.filename);

    const document = await this.prisma.document.create({
      data: {
        filename: input.filename,
        originalName: input.originalName,
        mimeType: input.mimeType,
        size: input.size,
        storageKey,
        status: 'UPLOADED',
        tenantId,
        userId,
      },
    });

    await this.queueService.addJob('document-processing', {
      documentId: document.id,
      tenantId,
    });

    return {
      ...document,
      error: document.error ?? undefined,
    };
  }

  async list(tenantId: string): Promise<DocumentResponse[]> {
    const docs = await this.prisma.document.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
    return docs.map(d => ({ ...d, error: d.error ?? undefined }));
  }

  async get(documentId: string, tenantId: string): Promise<DocumentResponse> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    return {
      ...document,
      error: document.error ?? undefined,
    };
  }

  async delete(documentId: string, tenantId: string): Promise<void> {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    await this.storageService.delete(document.storageKey);
    await this.prisma.document.delete({ where: { id: documentId } });
  }
}