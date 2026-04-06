 
# AISass - AI SaaS Platform

A production-grade multi-tenant AI SaaS platform built with NestJS, Next.js, PostgreSQL, and Redis.

## Architecture

### Backend (NestJS)
- **Modules**: Auth, Tenants, Users, AI Chat, Documents, RAG, Billing, Usage, Admin, Health
- **Layers**: Domain, Application, Infrastructure, Interfaces (Clean Architecture)
- **Database**: PostgreSQL with Prisma ORM
- **Cache/Queue**: Redis with BullMQ

### Frontend (Next.js 14)
- **Framework**: Next.js 14 App Router
- **UI**: React 18 + Tailwind CSS
- **State**: Zustand
- **Data Fetching**: Axios with interceptors

### Infrastructure
- **Container**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Cloud**: AWS (ECS, RDS, ElastiCache, S3) + GCP (Cloud Run, Cloud SQL, Memorystore)
- **IaC**: Terraform

## Features

### Multi-Tenancy
- Tenant/workspace isolation
- Role-based access control (OWNER, ADMIN, MEMBER)
- Tenant-aware query enforcement

### AI Chat
- Chat with OpenAI models (GPT-4, GPT-3.5)
- Thread-based conversation history
- Token usage tracking
- Response caching via Redis

### RAG / Document Q&A
- Document upload (PDF, TXT, MD, CSV)
- Background processing with BullMQ
- Text chunking and embedding
- Vector similarity search
- Context-aware responses

### Billing (Stripe)
- Subscription management
- Checkout sessions
- Webhook handling (idempotent)
- Plan limits enforcement

### Usage Tracking
- Per-tenant/request/token tracking
- Monthly aggregation
- Plan-based limits

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | NestJS, TypeScript |
| Database | PostgreSQL, Prisma |
| Cache/Queue | Redis, BullMQ |
| AI | OpenAI SDK |
| Frontend | Next.js 14, React 18 |
| UI | Tailwind CSS |
| State | Zustand |
| Billing | Stripe SDK |

## Getting Started

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourorg/aisass.git
cd aisass
```

2. Create `.env` file:
```bash
cp apps/backend/.env.example apps/backend/.env
```

3. Update `.env` with your settings:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/aisass_db
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_test_...
```

4. Start infrastructure:
```bash
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

5. Install dependencies:
```bash
npm install
```

6. Generate Prisma client and run migrations:
```bash
cd apps/backend
npx prisma generate
npx prisma migrate dev
```

7. Start backend:
```bash
npm run start:dev
```

8. Start frontend (new terminal):
```bash
cd apps/frontend
npm run dev
```

9. Access the app:
- Frontend: http://localhost:3000
- API Docs: http://localhost:3001/api/docs

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new user and tenant |
| POST | /auth/login | Login with email/password |
| POST | /auth/refresh | Refresh access token |
| POST | /auth/logout | Logout and revoke token |

### Tenants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /tenants/current | Get current tenant |
| PATCH | /tenants/current | Update tenant |
| GET | /tenants/usage | Get tenant usage stats |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users/me | Get current user |
| PATCH | /users/me | Update profile |

### AI Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/chat | Send chat message |
| GET | /ai/threads | List chat threads |
| GET | /ai/threads/:id/messages | Get thread messages |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /documents/upload | Upload document |
| GET | /documents | List documents |
| GET | /documents/:id | Get document |
| DELETE | /documents/:id | Delete document |

### RAG
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /rag/query | Query documents with RAG |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /billing/checkout-session | Create Stripe checkout |
| POST | /billing/webhook | Handle Stripe webhooks |
| GET | /billing/subscription | Get subscription |
| POST | /billing/cancel | Cancel subscription |

### Usage
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /usage/me | Get user usage |
| GET | /usage/tenant | Get tenant usage |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| GET | /ready | Readiness check |

## RAG Flow

1. **Upload**: User uploads document via `/documents/upload`
2. **Process**: Document is queued for background processing
3. **Chunk**: Text is split into chunks (1000 chars, 100 overlap)
4. **Embed**: Chunks are embedded using OpenAI embeddings
5. **Store**: Chunks and embeddings stored in PostgreSQL
6. **Query**: User sends query via `/rag/query`
7. **Retrieve**: Query is embedded, top-k chunks retrieved
8. **Answer**: Context + query sent to LLM, response returned

## Billing Flow

1. **Checkout**: User selects plan, creates checkout session
2. **Payment**: User redirected to Stripe
3. **Webhook**: Stripe sends `checkout.session.completed`
4. **Activate**: Subscription created, tenant plan updated
5. **Enforce**: Plan limits checked before operations

## Deployment

### AWS (ECS Fargate)
```bash
cd infrastructure/terraform/aws
terraform init
terraform apply
```

### GCP (Cloud Run)
```bash
cd infrastructure/terraform/gcp
terraform init
terraform apply
```

## Project Structure

```
aisass/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── auth/          # Auth module
│   │   │   ├── tenants/       # Tenant module
│   │   │   ├── users/         # User module
│   │   │   ├── ai-chat/       # AI chat module
│   │   │   ├── documents/     # Documents module
│   │   │   ├── rag/           # RAG module
│   │   │   ├── billing/       # Billing module
│   │   │   ├── usage/         # Usage module
│   │   │   ├── admin/         # Admin module
│   │   │   ├── health/        # Health module
│   │   │   ├── config/        # Configuration
│   │   │   └── common/        # Shared utilities
│   │   └── prisma/
│   │       └── schema.prisma  # Database schema
│   └── frontend/
│       ├── src/
│       │   ├── app/           # Next.js pages
│       │   ├── components/    # UI components
│       │   ├── lib/           # API client
│       │   ├── stores/        # Zustand stores
│       │   └── types/         # TypeScript types
├── packages/
│   └── shared/                # Shared DTOs/types
├── infrastructure/
│   ├── docker/                # Docker Compose
│   ├── terraform/
│   │   ├── aws/              # AWS Terraform
│   │   └── gcp/              # GCP Terraform
│   └── github-actions/       # CI/CD workflows
├── DECISION_RECORD.md         # Architecture decisions
└── package.json               # Workspace config
```

## Testing

```bash
# Run all tests
npm run test

# Run backend tests
npm run test --workspace=apps/backend

# Run frontend tests
npm run test --workspace=apps/frontend
```

## License

MIT
