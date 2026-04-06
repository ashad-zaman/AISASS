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
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("bullmq");
const ioredis_1 = require("ioredis");
let QueueService = class QueueService {
    constructor(redis) {
        this.redis = redis;
        this.queues = new Map();
    }
    getQueue(name) {
        if (!this.queues.has(name)) {
            this.queues.set(name, new bullmq_1.Queue(name, {
                connection: this.redis,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 1000 },
                    removeOnComplete: { count: 100 },
                    removeOnFail: { count: 50 },
                },
            }));
        }
        return this.queues.get(name);
    }
    async addJob(name, data) {
        const queue = this.getQueue(name);
        await queue.add(name, data);
    }
    async addJobWithOptions(name, data, opts) {
        const queue = this.getQueue(name);
        await queue.add(name, data, opts);
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('REDIS_CLIENT')),
    __metadata("design:paramtypes", [ioredis_1.default])
], QueueService);
//# sourceMappingURL=queue.service.js.map