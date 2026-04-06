export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: 'FREE' | 'PRO' | 'TEAM';
  stripeCustomerId?: string;
}

export interface Plan {
  id: string;
  name: string;
  type: 'FREE' | 'PRO' | 'TEAM';
  monthlyPrice: number;
  monthlyRequests: number;
  monthlyTokens: number;
  maxDocuments: number;
  maxFileSize: number;
}

export interface Subscription {
  id: string;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  plan: string;
  currentPeriodEnd: Date;
}

export interface UsageStats {
  requests: { used: number; limit: number };
  tokens: { used: number; limit: number };
  documents: { used: number; limit: number };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokenUsage?: number;
  createdAt: Date;
}

export interface Thread {
  id: string;
  title: string;
  model: string;
  createdAt: Date;
  messageCount: number;
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  status: 'UPLOADED' | 'PROCESSING' | 'INDEXED' | 'FAILED';
  createdAt: Date;
}

export interface RagSource {
  documentId: string;
  filename: string;
  chunkId: string;
  content: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}