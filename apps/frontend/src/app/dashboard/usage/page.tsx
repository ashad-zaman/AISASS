'use client';

import { useState, useEffect } from 'react';
import { BarChart3, MessageSquare, FileText, Cpu } from 'lucide-react';
import { usageApi } from '@/lib/api';

interface UsageStats {
  requests: { used: number; limit: number };
  tokens: { used: number; limit: number };
  documents: { used: number; limit: number };
}

export default function UsagePage() {
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    try {
      const response = await usageApi.getTenant();
      setUsage(response.data);
    } catch (error) {
      console.error('Error loading usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentage = (used: number, limit: number) => {
    if (limit === 0) return 0;
    return Math.round((used / limit) * 100);
  };

  const getColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-primary-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Usage</h1>
        <p className="text-gray-600">Monitor your resource usage</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary-500 mr-2" />
              <span className="font-medium">Requests</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            {usage?.requests.used.toLocaleString() || 0}
            <span className="text-lg font-normal text-gray-500">
              / {usage?.requests.limit.toLocaleString() || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getColor(getPercentage(usage?.requests.used || 0, usage?.requests.limit || 1))}`}
              style={{ width: `${getPercentage(usage?.requests.used || 0, usage?.requests.limit || 1)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Cpu className="h-5 w-5 text-primary-500 mr-2" />
              <span className="font-medium">Tokens</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            {usage?.tokens.used.toLocaleString() || 0}
            <span className="text-lg font-normal text-gray-500">
              / {usage?.tokens.limit.toLocaleString() || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getColor(getPercentage(usage?.tokens.used || 0, usage?.tokens.limit || 1))}`}
              style={{ width: `${getPercentage(usage?.tokens.used || 0, usage?.tokens.limit || 1)}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-primary-500 mr-2" />
              <span className="font-medium">Documents</span>
            </div>
          </div>
          <div className="text-3xl font-bold mb-2">
            {usage?.documents.used.toLocaleString() || 0}
            <span className="text-lg font-normal text-gray-500">
              / {usage?.documents.limit.toLocaleString() || 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getColor(getPercentage(usage?.documents.used || 0, usage?.documents.limit || 1))}`}
              style={{ width: `${getPercentage(usage?.documents.used || 0, usage?.documents.limit || 1)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}