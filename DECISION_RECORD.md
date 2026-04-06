# AISass Platform - Decision Record

## Technology Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS 10
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5.x
- **Cache/Queue**: Redis 7 + BullMQ 5
- **AI SDK**: OpenAI SDK 4.x
- **Vector Store**: pgvector (with fallback abstraction)
- **Billing**: Stripe SDK 14.x
- **Logging**: Pino 7.x

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5.x
- **UI**: React 18 + Tailwind CSS 3.x
- **State**: Zustand 4.x
- **Data Fetching**: TanStack Query 5.x
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Container**: Docker 24 + Docker Compose 2.x
- **CI/CD**: GitHub Actions
- **Cloud Targets**: AWS (ECS, RDS, ElastiCache, S3) + GCP (Cloud Run, Cloud SQL, Memorystore)

---

## Service Names & Package Names

### Backend Services
- `aisass-backend` - Main NestJS application

### Shared Packages (Monorepo)
- `@aisass/shared` - Shared DTOs, constants, types
- `@aisass/config` - Configuration module

### Database Schema
- Database: `aisass_db`

---

## Table Names (Prisma)

### Core Tables
- `Tenant` - Organizations/workspaces
- `User` - Users belonging to tenants
- `TenantMembership` - User-Tenant relationship with roles
- `RefreshToken` - JWT refresh tokens

### AI/Tenant Data
- `AiThread` - Conversation threads
- `AiMessage` - Individual messages in threads
- `Document` - Uploaded documents metadata
- `DocumentChunk` - Chunked document content
- `Embedding` - Vector embeddings (stored in pgvector)

### Billing
- `Plan` - Subscription plans
- `Subscription` - Tenant subscriptions
- `Invoice` - Billing history

### Tracking
- `UsageLog` - API usage tracking
- `JobStatus` - Background job status

---

## Environment Variables

### Required
```
# App
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=
JWT_REFRESH_SECRET=
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4-turbo-preview

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_PRO=
STRIPE_PRICE_ID_TEAM=

# Storage
STORAGE_TYPE=local  # or s3, gcs
STORAGE_LOCAL_PATH=./uploads
AWS_S3_BUCKET=
AWS_REGION=

# Vector Store
VECTOR_DIMENSION=1536  # for text-embedding-3-small

# Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100
```

---

## Module Structure

### Backend Modules (NestJS)
1. `auth` - Authentication (register, login, refresh, logout)
2. `tenants` - Tenant management
3. `users` - User profile management
4. `ai-chat` - AI chat endpoints
5. `documents` - Document upload/management
6. `rag` - RAG/retrieval pipeline
7. `billing` - Stripe integration
8. `usage` - Usage tracking
9. `admin` - Admin observability
10. `health` - Health/readiness endpoints

### Layer Structure (Clean Architecture)
- `domain/` - Entities, interfaces, value objects
- `application/` - Use cases, DTOs, services
- `infrastructure/` - DB, external services, providers
- `interfaces/` - Controllers, guards, filters, DTOs
- `common/` - Shared utilities, constants, decorators

---

## Provider Abstractions

1. **ILLMProvider** - LLM abstraction
   - `generateChatCompletion()`
   - `generateStreamingChatCompletion()`
   - `countTokens()`

2. **IEmbeddingsProvider** - Embeddings abstraction
   - `generateEmbeddings()`
   - `getVectorDimension()`

3. **IVectorStoreProvider** - Vector store abstraction
   - `upsert()`
   - `query()`
   - `delete()`

4. **IStorageProvider** - File storage abstraction
   - `upload()`
   - `download()`
   - `delete()`

5. **IBillingProvider** - Billing abstraction
   - `createCustomer()`
   - `createCheckoutSession()`
   - `getSubscription()`
   - `cancelSubscription()`

---

## API Endpoints

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/reset-password

### Tenants
- GET /tenants/current
- PATCH /tenants/current

### Users
- GET /users/me
- PATCH /users/me

### AI Chat
- POST /ai/chat
- GET /ai/threads
- GET /ai/threads/:id/messages

### Documents
- POST /documents/upload
- GET /documents
- GET /documents/:id
- DELETE /documents/:id

### RAG
- POST /rag/query

### Billing
- POST /billing/checkout-session
- POST /billing/webhook
- GET /billing/subscription

### Usage
- GET /usage/me
- GET /usage/tenant

### Health
- GET /health
- GET /ready

---

## Plan Details

| Feature | Free | Pro | Team |
|---------|------|-----|------|
| Monthly Requests | 100 | 5,000 | Unlimited |
| Monthly Tokens | 10,000 | 500,000 | Unlimited |
| Documents | 5 | 100 | Unlimited |
| Max File Size | 5MB | 25MB | 100MB |
| Models | gpt-3.5 | gpt-4 | All |
| Support | Community | Email | Priority |

---

## Decision: Multi-Tenancy Approach
- Database-level isolation (all tables have tenant_id)
- Row-level security via Prisma middleware
- Tenant context extracted from JWT

## Decision: RAG Approach
- Background job for document processing
- Synchronous query endpoint with caching
- Hybrid retrieval (vector + keyword)
- Citations in response

## Decision: Deployment Strategy
- Docker Compose for local
- GitHub Actions for CI/CD
- Terraform for AWS/GCP infrastructure