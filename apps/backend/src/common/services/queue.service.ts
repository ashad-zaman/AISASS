import { Injectable, Inject } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

export interface JobData {
  [key: string]: any;
}

@Injectable()
export class QueueService {
  private queues: Map<string, Queue> = new Map();

  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.queues.set(
        name,
        new Queue(name, {
          connection: this.redis,
          defaultJobOptions: {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: { count: 100 },
            removeOnFail: { count: 50 },
          },
        }),
      );
    }
    return this.queues.get(name)!;
  }

  async addJob(name: string, data: JobData): Promise<void> {
    const queue = this.getQueue(name);
    await queue.add(name, data);
  }

  async addJobWithOptions(name: string, data: JobData, opts?: any): Promise<void> {
    const queue = this.getQueue(name);
    await queue.add(name, data, opts);
  }
}