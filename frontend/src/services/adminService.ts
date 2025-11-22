// frontend/src/services/adminService.ts
import { API_BASE_URL } from '@/config/api';

export interface QuotaAnalytics {
  summary: {
    totalUsers: number;
    totalAnalyses: number;
    avgUtilizationRate: number;
    usersNearLimit: number;
    generatedAt: string;
  };
  planBreakdown: Array<{
    _id: string;
    totalUsers: number;
    totalAnalyses: number;
    avgAnalysesPerUser: number;
    totalQuotaUsed: number;
    totalQuotaLimit: number;
    utilizationRate: number;
  }>;
  usageTrends: Array<{
    _id: string;
    planBreakdown: Array<{
      plan: string;
      analyses: number;
      users: number;
    }>;
    totalAnalyses: number;
  }>;
  usersNearLimit: Array<{
    email: string;
    plan: string;
    currentUsage: {
      analyses: number;
    };
    quotaLimit: number;
    utilizationRate: number;
    lastAnalysisAt: string;
  }>;
  recommendations: Array<{
    type: string;
    priority: string;
    message: string;
    action: string;
  }>;
}

export interface SystemMetrics {
  timestamp: string;
  system: {
    uptime: number;
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    cpu: {
      user: number;
      system: number;
    };
    nodeVersion: string;
    platform: string;
  };
  database: {
    connections: string;
    operations: string;
    performance: string;
  };
  errors: {
    last24h: number;
    unresolved: number;
  };
  users: {
    total: number;
    active24h: number;
  };
}

export interface SecurityMetrics {
  timestamp: string;
  recentAttempts: {
    last15Minutes: number;
    last24Hours: number;
  };
  attemptsByType: Array<{
    _id: string;
    count: number;
  }>;
  topFailedIPs: Array<{
    _id: string;
    count: number;
    lastAttempt: string;
  }>;
  lockedAccounts: {
    count: number;
    accounts: Array<{
      identifier: string;
      lockedUntil: string;
      attemptCount: number;
    }>;
  };
}

export const adminService = {
  /**
   * Get comprehensive quota and usage analytics
   */
  async getQuotaAnalytics(token: string): Promise<QuotaAnalytics> {
    const response = await fetch(`${API_BASE_URL}/api/admin/quota-analytics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la récupération des analytics');
    }

    const data = await response.json();
    return data.analytics;
  },

  /**
   * Get real-time system metrics
   */
  async getSystemMetrics(token: string): Promise<SystemMetrics> {
    const response = await fetch(`${API_BASE_URL}/api/admin/system-metrics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la récupération des métriques');
    }

    const data = await response.json();
    return data.metrics;
  },

  /**
   * Get security monitoring metrics
   */
  async getSecurityMetrics(token: string): Promise<SecurityMetrics> {
    const response = await fetch(`${API_BASE_URL}/api/admin/security-metrics`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la récupération des métriques de sécurité');
    }

    const data = await response.json();
    return data.metrics;
  },
};
