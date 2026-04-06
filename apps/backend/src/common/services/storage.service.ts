import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as fs } from 'fs';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';

export interface StorageProvider {
  upload(buffer: Buffer, filename: string): Promise<string>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}

@Injectable()
export class StorageService implements StorageProvider {
  private storageType: 'local' | 's3' | 'gcs';
  private localPath: string;

  constructor(private config: ConfigService) {
    this.storageType = config.get<string>('storage.type') as any || 'local';
    this.localPath = config.get<string>('storage.localPath') || './uploads';
  }

  async upload(buffer: Buffer, filename: string): Promise<string> {
    if (this.storageType === 'local') {
      return this.uploadLocal(buffer, filename);
    }
    return this.uploadS3(buffer, filename);
  }

  async download(key: string): Promise<Buffer> {
    if (this.storageType === 'local') {
      return this.downloadLocal(key);
    }
    return this.downloadS3(key);
  }

  async delete(key: string): Promise<void> {
    if (this.storageType === 'local') {
      return this.deleteLocal(key);
    }
    return this.deleteS3(key);
  }

  private async uploadLocal(buffer: Buffer, filename: string): Promise<string> {
    const key = `${uuidv4()}-${filename}`;
    const dir = join(this.localPath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(join(dir, key), buffer);
    return key;
  }

  private async downloadLocal(key: string): Promise<Buffer> {
    return fs.readFile(join(this.localPath, key));
  }

  private async deleteLocal(key: string): Promise<void> {
    try {
      await fs.unlink(join(this.localPath, key));
    } catch (e) {
      // ignore if not found
    }
  }

  private async uploadS3(buffer: Buffer, filename: string): Promise<string> {
    // S3 implementation would go here
    // Using local for now as placeholder
    return this.uploadLocal(buffer, filename);
  }

  private async downloadS3(key: string): Promise<Buffer> {
    // S3 implementation would go here
    return this.downloadLocal(key);
  }

  private async deleteS3(key: string): Promise<void> {
    // S3 implementation would go here
    return this.deleteLocal(key);
  }
}