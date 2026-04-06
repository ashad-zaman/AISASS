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
exports.UsageResponseDto = exports.UsageStatDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UsageStatDto {
}
exports.UsageStatDto = UsageStatDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UsageStatDto.prototype, "used", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UsageStatDto.prototype, "limit", void 0);
class UsageResponseDto {
}
exports.UsageResponseDto = UsageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", UsageStatDto)
], UsageResponseDto.prototype, "requests", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", UsageStatDto)
], UsageResponseDto.prototype, "tokens", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", UsageStatDto)
], UsageResponseDto.prototype, "documents", void 0);
//# sourceMappingURL=usage.dto.js.map