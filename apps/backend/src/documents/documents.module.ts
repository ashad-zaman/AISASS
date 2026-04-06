import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocumentsController } from './interfaces/documents.controller';
import { DocumentsService } from './application/documents.service';
import { StorageService } from '../common/services/storage.service';
import { QueueService } from '../common/services/queue.service';

@Module({
  imports: [
    MulterModule.register({
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: { expiresIn: config.get<string>('jwt.expiresIn') },
      }),
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, StorageService, QueueService],
  exports: [DocumentsService],
})
export class DocumentsModule {}