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
exports.StorageService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
let StorageService = class StorageService {
    constructor(config) {
        this.config = config;
        this.storageType = config.get('storage.type') || 'local';
        this.localPath = config.get('storage.localPath') || './uploads';
    }
    async upload(buffer, filename) {
        if (this.storageType === 'local') {
            return this.uploadLocal(buffer, filename);
        }
        return this.uploadS3(buffer, filename);
    }
    async download(key) {
        if (this.storageType === 'local') {
            return this.downloadLocal(key);
        }
        return this.downloadS3(key);
    }
    async delete(key) {
        if (this.storageType === 'local') {
            return this.deleteLocal(key);
        }
        return this.deleteS3(key);
    }
    async uploadLocal(buffer, filename) {
        const key = `${(0, uuid_1.v4)()}-${filename}`;
        const dir = (0, path_1.join)(this.localPath);
        await fs_1.promises.mkdir(dir, { recursive: true });
        await fs_1.promises.writeFile((0, path_1.join)(dir, key), buffer);
        return key;
    }
    async downloadLocal(key) {
        return fs_1.promises.readFile((0, path_1.join)(this.localPath, key));
    }
    async deleteLocal(key) {
        try {
            await fs_1.promises.unlink((0, path_1.join)(this.localPath, key));
        }
        catch (e) {
        }
    }
    async uploadS3(buffer, filename) {
        return this.uploadLocal(buffer, filename);
    }
    async downloadS3(key) {
        return this.downloadLocal(key);
    }
    async deleteS3(key) {
        return this.deleteLocal(key);
    }
};
exports.StorageService = StorageService;
exports.StorageService = StorageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], StorageService);
//# sourceMappingURL=storage.service.js.map