import { z } from 'zod';

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().default(3001),
  apiPrefix: z.string().default('/api/v1'),
  corsOrigin: z.string().default('http://localhost:3000'),

  database: z.object({
    url: z.string().url(),
  }),

  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().default(6379),
    password: z.string().optional(),
    db: z.number().default(0),
  }),

  jwt: z.object({
    secret: z.string().default('dev-secret-change-in-production-min-32-chars'),
    refreshSecret: z.string().default('dev-refresh-secret-change-in-production-min-32-chars'),
    expiresIn: z.string().default('15m'),
    refreshExpiresIn: z.string().default('7d'),
  }),

  openai: z.object({
    apiKey: z.string().optional().default(''),
    model: z.string().default('gpt-4-turbo-preview'),
    embeddingModel: z.string().default('text-embedding-3-small'),
  }),

  stripe: z.object({
    secretKey: z.string().optional().default(''),
    webhookSecret: z.string().optional().default(''),
    priceIdPro: z.string().optional(),
    priceIdTeam: z.string().optional(),
  }),

  storage: z.object({
    type: z.enum(['local', 's3', 'gcs']).default('local'),
    localPath: z.string().default('./uploads'),
    s3Bucket: z.string().optional(),
    s3Region: z.string().optional(),
  }),

  vector: z.object({
    dimension: z.number().default(1536),
  }),

  rateLimit: z.object({
    ttl: z.number().default(60000),
    max: z.number().default(100),
  }),
});

export type Config = z.infer<typeof configSchema>;

export default () => {
  const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3001', 10),
    apiPrefix: process.env.API_PREFIX || '/api/v1',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

    database: {
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/aisass_db',
    },

    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0', 10),
    },

    jwt: {
      secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
      refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
      embeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
    },

    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
      priceIdPro: process.env.STRIPE_PRICE_ID_PRO,
      priceIdTeam: process.env.STRIPE_PRICE_ID_TEAM,
    },

    storage: {
      type: (process.env.STORAGE_TYPE || 'local') as 'local' | 's3' | 'gcs',
      localPath: process.env.STORAGE_LOCAL_PATH || './uploads',
      s3Bucket: process.env.AWS_S3_BUCKET,
      s3Region: process.env.AWS_REGION || 'us-east-1',
    },

    vector: {
      dimension: parseInt(process.env.VECTOR_DIMENSION || '1536', 10),
    },

    rateLimit: {
      ttl: parseInt(process.env.RATE_LIMIT_TTL || '60000', 10),
      max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    },
  };

  return configSchema.parse(config);
};