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
exports.SubscriptionDto = exports.WebhookResponseDto = exports.CheckoutSessionResponseDto = exports.CheckoutSessionDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class CheckoutSessionDto {
}
exports.CheckoutSessionDto = CheckoutSessionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ['PRO', 'TEAM'] }),
    (0, class_validator_1.IsEnum)(['PRO', 'TEAM']),
    __metadata("design:type", String)
], CheckoutSessionDto.prototype, "planType", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CheckoutSessionDto.prototype, "successUrl", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsUrl)(),
    __metadata("design:type", String)
], CheckoutSessionDto.prototype, "cancelUrl", void 0);
class CheckoutSessionResponseDto {
}
exports.CheckoutSessionResponseDto = CheckoutSessionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CheckoutSessionResponseDto.prototype, "sessionId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], CheckoutSessionResponseDto.prototype, "url", void 0);
class WebhookResponseDto {
}
exports.WebhookResponseDto = WebhookResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], WebhookResponseDto.prototype, "received", void 0);
class SubscriptionDto {
}
exports.SubscriptionDto = SubscriptionDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], SubscriptionDto.prototype, "plan", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], SubscriptionDto.prototype, "currentPeriodEnd", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], SubscriptionDto.prototype, "cancelAtPeriodEnd", void 0);
//# sourceMappingURL=billing.dto.js.map