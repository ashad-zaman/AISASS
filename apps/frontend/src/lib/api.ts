import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

export const authApi = {
  register: (data: { email: string; password: string; firstName?: string; lastName?: string; tenantName?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  logout: () => api.post('/auth/logout'),
};

export const tenantsApi = {
  getCurrent: () => api.get('/tenants/current'),
  update: (data: { name?: string; settings?: any }) => api.patch('/tenants/current', data),
  getUsage: () => api.get('/tenants/usage'),
};

export const usersApi = {
  getMe: () => api.get('/users/me'),
  update: (data: { firstName?: string; lastName?: string; avatarUrl?: string }) => 
    api.patch('/users/me', data),
};

export const aiChatApi = {
  chat: (data: { threadId?: string; message: string; systemPrompt?: string; model?: string }) =>
    api.post('/ai/chat', data),
  getThreads: () => api.get('/ai/threads'),
  getMessages: (threadId: string) => api.get(`/ai/threads/${threadId}/messages`),
};

export const documentsApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: () => api.get('/documents'),
  get: (id: string) => api.get(`/documents/${id}`),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

export const ragApi = {
  query: (data: { query: string; topK?: number }) =>
    api.post('/rag/query', data),
};

export const billingApi = {
  createCheckout: (data: { planType: 'PRO' | 'TEAM'; successUrl: string; cancelUrl: string }) =>
    api.post('/billing/checkout-session', data),
  getSubscription: () => api.get('/billing/subscription'),
  cancel: () => api.post('/billing/cancel'),
};

export const usageApi = {
  getMe: () => api.get('/usage/me'),
  getTenant: () => api.get('/usage/tenant'),
};