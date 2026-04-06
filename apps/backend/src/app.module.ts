import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { UsersModule } from './users/users.module';
import { AiChatModule } from './ai-chat/ai-chat.module';
import { DocumentsModule } from './documents/documents.module';
import { RagModule } from './rag/rag.module';
import { BillingModule } from './billing/billing.module';
import { UsageModule } from './usage/usage.module';
import { AdminModule } from './admin/admin.module';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './config/prisma.module';
import { RedisModule } from './config/redis.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: config.get<number>('rateLimit.ttl') || 60000,
            limit: config.get<number>('rateLimit.max') || 100,
          },
        ],
      }),
    }),
    PrismaModule,
    RedisModule,
    AuthModule,
    TenantsModule,
    UsersModule,
    AiChatModule,
    DocumentsModule,
    RagModule,
    BillingModule,
    UsageModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}