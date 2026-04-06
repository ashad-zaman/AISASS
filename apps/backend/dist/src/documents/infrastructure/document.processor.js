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
var DocumentProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentProcessor = void 0;
const common_1 = require("@nestjs/common");
const rag_service_1 = require("../../rag/application/rag.service");
let DocumentProcessor = DocumentProcessor_1 = class DocumentProcessor {
    constructor(ragService) {
        this.ragService = ragService;
        this.logger = new common_1.Logger(DocumentProcessor_1.name);
    }
    async processDocument(job) {
        const { documentId, tenantId } = job.data;
        this.logger.log(`Processing document ${documentId} for tenant ${tenantId}`);
        try {
            await this.ragService.processDocument(documentId);
            this.logger.log(`Successfully processed document ${documentId}`);
        }
        catch (error) {
            this.logger.error(`Failed to process document ${documentId}`, error);
            throw error;
        }
    }
};
exports.DocumentProcessor = DocumentProcessor;
exports.DocumentProcessor = DocumentProcessor = DocumentProcessor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [rag_service_1.RagService])
], DocumentProcessor);
//# sourceMappingURL=document.processor.js.map