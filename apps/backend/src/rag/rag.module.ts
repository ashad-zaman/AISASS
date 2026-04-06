import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RagController } from './interfaces/rag.controller';
import { RagService } from './application/rag.service';
import { StorageService } from '../common/services/storage.service';
import { QueueService } from '../common/services/queue.service';

@Module({
  imports: [
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
  controllers: [RagController],
  providers: [RagService, StorageService, QueueService],
  exports: [RagService],
})
export class RagModule {}