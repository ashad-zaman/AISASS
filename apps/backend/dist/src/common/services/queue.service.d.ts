import { Queue } from 'bullmq';
import Redis from 'ioredis';
export interface JobData {
    [key: string]: any;
}
export declare class QueueService {
    private redis;
    private queues;
    constructor(redis: Redis);
    getQueue(name: string): Queue;
    addJob(name: string, data: JobData): Promise<void>;
    addJobWithOptions(name: string, data: JobData, opts?: any): Promise<void>;
}
