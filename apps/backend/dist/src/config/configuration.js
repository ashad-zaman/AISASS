"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const configSchema = zod_1.z.object({
    nodeEnv: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    port: zod_1.z.number().default(3001),
    apiPrefix: zod_1.z.string().default('/api/v1'),
    corsOrigin: zod_1.z.string().default('http://localhost:3000'),
    database: zod_1.z.object({
        url: zod_1.z.string().url(),
    }),
    redis: zod_1.z.object({
        host: zod_1.z.string().default('localhost'),
        port: zod_1.z.number().default(6379),
        password: zod_1.z.string().optional(),
        db: zod_1.z.number().default(0),
    }),
    jwt: zod_1.z.object({
        secret: zod_1.z.string().default('dev-secret-change-in-production-min-32-chars'),
        refreshSecret: zod_1.z.string().default('dev-refresh-secret-change-in-production-min-32-chars'),
        expiresIn: zod_1.z.string().default('15m'),
        refreshExpiresIn: zod_1.z.string().default('7d'),
    }),
    openai: zod_1.z.object({
        apiKey: zod_1.z.string().optional().default(''),
        model: zod_1.z.string().default('gpt-4-turbo-preview'),
        embeddingModel: zod_1.z.string().default('text-embedding-3-small'),
    }),
    stripe: zod_1.z.object({
        secretKey: zod_1.z.string().optional().default(''),
        webhookSecret: zod_1.z.string().optional().default(''),
        priceIdPro: zod_1.z.string().optional(),
        priceIdTeam: zod_1.z.string().optional(),
    }),
    storage: zod_1.z.object({
        type: zod_1.z.enum(['local', 's3', 'gcs']).default('local'),
        localPath: zod_1.z.string().default('./uploads'),
        s3Bucket: zod_1.z.string().optional(),
        s3Region: zod_1.z.string().optional(),
    }),
    vector: zod_1.z.object({
        dimension: zod_1.z.number().default(1536),
    }),
    rateLimit: zod_1.z.object({
        ttl: zod_1.z.number().default(60000),
        max: zod_1.z.number().default(100),
    }),
});
exports.default = () => {
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
            type: (process.env.STORAGE_TYPE || 'local'),
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
//# sourceMappingURL=configuration.js.map