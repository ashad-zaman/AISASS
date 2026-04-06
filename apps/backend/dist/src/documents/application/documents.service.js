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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../config/prisma.service");
const storage_service_1 = require("../../common/services/storage.service");
const queue_service_1 = require("../../common/services/queue.service");
let DocumentsService = class DocumentsService {
    constructor(prisma, config, storageService, queueService) {
        this.prisma = prisma;
        this.config = config;
        this.storageService = storageService;
        this.queueService = queueService;
    }
    async upload(userId, tenantId, input) {
        const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
        const plan = await this.prisma.plan.findUnique({ where: { type: tenant?.plan || 'FREE' } });
        const docCount = await this.prisma.document.count({ where: { tenantId } });
        if (plan && docCount >= plan.maxDocuments) {
            throw new common_1.ForbiddenException('Document limit exceeded');
        }
        if (plan && input.size > plan.maxFileSize) {
            throw new common_1.ForbiddenException('File size exceeds plan limit');
        }
        const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'];
        if (!allowedTypes.includes(input.mimeType)) {
            throw new common_1.BadRequestException('File type not allowed');
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
    async list(tenantId) {
        const docs = await this.prisma.document.findMany({
            where: { tenantId },
            orderBy: { createdAt: 'desc' },
        });
        return docs.map(d => ({ ...d, error: d.error ?? undefined }));
    }
    async get(documentId, tenantId) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, tenantId },
        });
        if (!document) {
            throw new common_1.BadRequestException('Document not found');
        }
        return {
            ...document,
            error: document.error ?? undefined,
        };
    }
    async delete(documentId, tenantId) {
        const document = await this.prisma.document.findFirst({
            where: { id: documentId, tenantId },
        });
        if (!document) {
            throw new common_1.BadRequestException('Document not found');
        }
        await this.storageService.delete(document.storageKey);
        await this.prisma.document.delete({ where: { id: documentId } });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService,
        storage_service_1.StorageService,
        queue_service_1.QueueService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map