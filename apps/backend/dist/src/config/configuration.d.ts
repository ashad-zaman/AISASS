import { z } from 'zod';
declare const configSchema: z.ZodObject<{
    nodeEnv: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    port: z.ZodDefault<z.ZodNumber>;
    apiPrefix: z.ZodDefault<z.ZodString>;
    corsOrigin: z.ZodDefault<z.ZodString>;
    database: z.ZodObject<{
        url: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        url: string;
    }, {
        url: string;
    }>;
    redis: z.ZodObject<{
        host: z.ZodDefault<z.ZodString>;
        port: z.ZodDefault<z.ZodNumber>;
        password: z.ZodOptional<z.ZodString>;
        db: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        port: number;
        host: string;
        db: number;
        password?: string | undefined;
    }, {
        password?: string | undefined;
        port?: number | undefined;
        host?: string | undefined;
        db?: number | undefined;
    }>;
    jwt: z.ZodObject<{
        secret: z.ZodDefault<z.ZodString>;
        refreshSecret: z.ZodDefault<z.ZodString>;
        expiresIn: z.ZodDefault<z.ZodString>;
        refreshExpiresIn: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    }, {
        secret?: string | undefined;
        refreshSecret?: string | undefined;
        expiresIn?: string | undefined;
        refreshExpiresIn?: string | undefined;
    }>;
    openai: z.ZodObject<{
        apiKey: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        model: z.ZodDefault<z.ZodString>;
        embeddingModel: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        model: string;
        apiKey: string;
        embeddingModel: string;
    }, {
        model?: string | undefined;
        apiKey?: string | undefined;
        embeddingModel?: string | undefined;
    }>;
    stripe: z.ZodObject<{
        secretKey: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        webhookSecret: z.ZodDefault<z.ZodOptional<z.ZodString>>;
        priceIdPro: z.ZodOptional<z.ZodString>;
        priceIdTeam: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        secretKey: string;
        webhookSecret: string;
        priceIdPro?: string | undefined;
        priceIdTeam?: string | undefined;
    }, {
        secretKey?: string | undefined;
        webhookSecret?: string | undefined;
        priceIdPro?: string | undefined;
        priceIdTeam?: string | undefined;
    }>;
    storage: z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["local", "s3", "gcs"]>>;
        localPath: z.ZodDefault<z.ZodString>;
        s3Bucket: z.ZodOptional<z.ZodString>;
        s3Region: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type: "local" | "s3" | "gcs";
        localPath: string;
        s3Bucket?: string | undefined;
        s3Region?: string | undefined;
    }, {
        type?: "local" | "s3" | "gcs" | undefined;
        localPath?: string | undefined;
        s3Bucket?: string | undefined;
        s3Region?: string | undefined;
    }>;
    vector: z.ZodObject<{
        dimension: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        dimension: number;
    }, {
        dimension?: number | undefined;
    }>;
    rateLimit: z.ZodObject<{
        ttl: z.ZodDefault<z.ZodNumber>;
        max: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        ttl: number;
        max: number;
    }, {
        ttl?: number | undefined;
        max?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    port: number;
    nodeEnv: "development" | "production" | "test";
    apiPrefix: string;
    corsOrigin: string;
    database: {
        url: string;
    };
    redis: {
        port: number;
        host: string;
        db: number;
        password?: string | undefined;
    };
    openai: {
        model: string;
        apiKey: string;
        embeddingModel: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        priceIdPro?: string | undefined;
        priceIdTeam?: string | undefined;
    };
    storage: {
        type: "local" | "s3" | "gcs";
        localPath: string;
        s3Bucket?: string | undefined;
        s3Region?: string | undefined;
    };
    vector: {
        dimension: number;
    };
    rateLimit: {
        ttl: number;
        max: number;
    };
}, {
    jwt: {
        secret?: string | undefined;
        refreshSecret?: string | undefined;
        expiresIn?: string | undefined;
        refreshExpiresIn?: string | undefined;
    };
    database: {
        url: string;
    };
    redis: {
        password?: string | undefined;
        port?: number | undefined;
        host?: string | undefined;
        db?: number | undefined;
    };
    openai: {
        model?: string | undefined;
        apiKey?: string | undefined;
        embeddingModel?: string | undefined;
    };
    stripe: {
        secretKey?: string | undefined;
        webhookSecret?: string | undefined;
        priceIdPro?: string | undefined;
        priceIdTeam?: string | undefined;
    };
    storage: {
        type?: "local" | "s3" | "gcs" | undefined;
        localPath?: string | undefined;
        s3Bucket?: string | undefined;
        s3Region?: string | undefined;
    };
    vector: {
        dimension?: number | undefined;
    };
    rateLimit: {
        ttl?: number | undefined;
        max?: number | undefined;
    };
    port?: number | undefined;
    nodeEnv?: "development" | "production" | "test" | undefined;
    apiPrefix?: string | undefined;
    corsOrigin?: string | undefined;
}>;
export type Config = z.infer<typeof configSchema>;
declare const _default: () => {
    jwt: {
        secret: string;
        refreshSecret: string;
        expiresIn: string;
        refreshExpiresIn: string;
    };
    port: number;
    nodeEnv: "development" | "production" | "test";
    apiPrefix: string;
    corsOrigin: string;
    database: {
        url: string;
    };
    redis: {
        port: number;
        host: string;
        db: number;
        password?: string | undefined;
    };
    openai: {
        model: string;
        apiKey: string;
        embeddingModel: string;
    };
    stripe: {
        secretKey: string;
        webhookSecret: string;
        priceIdPro?: string | undefined;
        priceIdTeam?: string | undefined;
    };
    storage: {
        type: "local" | "s3" | "gcs";
        localPath: string;
        s3Bucket?: string | undefined;
        s3Region?: string | undefined;
    };
    vector: {
        dimension: number;
    };
    rateLimit: {
        ttl: number;
        max: number;
    };
};
export default _default;
