import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../config/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import { QueueService } from '../../common/services/queue.service';
import { OpenAI } from 'openai';

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
  sources: { documentId: string; filename: string; chunkId: string; content: string }[];
}

@Injectable()
export class RagService {
  private openai: OpenAI;

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private storageService: StorageService,
    private queueService: QueueService,
  ) {
    this.openai = new OpenAI({
      apiKey: config.get<string>('openai.apiKey'),
    });
  }

  async processDocument(documentId: string): Promise<void> {
    const document = await this.prisma.document.findUnique({ where: { id: documentId } });
    if (!document) {
      throw new NotFoundException('Document not found');
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
    } catch (error) {
      await this.prisma.document.update({
        where: { id: documentId },
        data: { status: 'FAILED', error: (error as Error).message },
      });
      throw error;
    }
  }

  chunkText(content: string, chunkSize: number = 1000, overlap: number = 100): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < content.length) {
      const end = Math.min(start + chunkSize, content.length);
      chunks.push(content.slice(start, end));
      start += chunkSize - overlap;
    }

    return chunks;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.config.get<string>('openai.embeddingModel') || 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  async query(tenantId: string, input: RagQueryInput): Promise<RagQueryResponse> {
    const queryEmbedding = await this.generateEmbedding(input.query);
    const topK = input.topK || 5;

    const chunks = await this.prisma.documentChunk.findMany({
      where: { document: { tenantId, status: 'INDEXED' } },
      take: topK * 2,
      orderBy: { content: 'asc' },
    });

    const results: RetrievalResult[] = [];
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
      model: this.config.get<string>('openai.model') || 'gpt-4-turbo-preview',
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

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magA * magB);
  }
}