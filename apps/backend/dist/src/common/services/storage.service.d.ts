import { ConfigService } from '@nestjs/config';
export interface StorageProvider {
    upload(buffer: Buffer, filename: string): Promise<string>;
    download(key: string): Promise<Buffer>;
    delete(key: string): Promise<void>;
}
export declare class StorageService implements StorageProvider {
    private config;
    private storageType;
    private localPath;
    constructor(config: ConfigService);
    upload(buffer: Buffer, filename: string): Promise<string>;
    download(key: string): Promise<Buffer>;
    delete(key: string): Promise<void>;
    private uploadLocal;
    private downloadLocal;
    private deleteLocal;
    private uploadS3;
    private downloadS3;
    private deleteS3;
}
