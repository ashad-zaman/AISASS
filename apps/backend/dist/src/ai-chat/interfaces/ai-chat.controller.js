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
exports.AiChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const ai_chat_service_1 = require("../application/ai-chat.service");
const ai_chat_dto_1 = require("../application/ai-chat.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let AiChatController = class AiChatController {
    constructor(aiChatService) {
        this.aiChatService = aiChatService;
    }
    async chat(user, dto) {
        return this.aiChatService.chat(user.id, user.tenantId, dto);
    }
    async listThreads(user) {
        const threads = await this.aiChatService.getThreads(user.tenantId, user.id);
        return threads.map(t => ({
            id: t.id,
            title: t.title,
            model: t.model,
            createdAt: t.createdAt,
            updatedAt: t.updatedAt,
            messageCount: t._count.messages,
        }));
    }
    async getMessages(user, threadId) {
        const messages = await this.aiChatService.getThreadMessages(threadId, user.tenantId);
        return messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content,
            tokenUsage: m.tokenUsage,
            createdAt: m.createdAt,
        }));
    }
};
exports.AiChatController = AiChatController;
__decorate([
    (0, common_1.Post)('chat'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a chat message' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, ai_chat_dto_1.ChatRequestDto]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "chat", null);
__decorate([
    (0, common_1.Get)('threads'),
    (0, swagger_1.ApiOperation)({ summary: 'List chat threads' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "listThreads", null);
__decorate([
    (0, common_1.Get)('threads/:id/messages'),
    (0, swagger_1.ApiOperation)({ summary: 'Get thread messages' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AiChatController.prototype, "getMessages", null);
exports.AiChatController = AiChatController = __decorate([
    (0, swagger_1.ApiTags)('AI Chat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('ai'),
    __metadata("design:paramtypes", [ai_chat_service_1.AiChatService])
], AiChatController);
//# sourceMappingURL=ai-chat.controller.js.map