// frontend/src/services/gdprService.ts
import { API_BASE_URL } from '@/config/api';

export interface UserDataExport {
  exportDate: string;
  exportVersion: string;
  user: {
    email: string;
    plan: string;
    createdAt: string;
    lastLogin: string;
    analysisCount: number;
    quota: {
      monthly: number;
      currentUsage: number;
    };
  };
  analyses: any[];
  activeSessions: any[];
  statistics: {
    totalAnalyses: number;
    averageScore: string;
  };
}

export interface ConsentStatus {
  analytics: boolean;
  marketing: boolean;
  dataProcessing: boolean;
  lastUpdated: string;
}

export interface RetentionPolicy {
  analyses: {
    retention: string;
    description: string;
  };
  sessions: {
    retention: string;
    description: string;
  };
  failedAttempts: {
    retention: string;
    description: string;
  };
  webhookEvents: {
    retention: string;
    description: string;
  };
  accountDeletion: {
    process: string;
    description: string;
  };
  contact: {
    dpo: string;
    privacy: string;
  };
}

export const gdprService = {
  /**
   * Export all user data (GDPR Article 20 - Right to data portability)
   */
  async exportUserData(token: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/api/gdpr/export`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de l\'exportation des données');
    }

    return response.blob();
  },

  /**
   * Get consent status
   */
  async getConsent(token: string): Promise<ConsentStatus> {
    const response = await fetch(`${API_BASE_URL}/api/gdpr/consent`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la récupération du consentement');
    }

    const data = await response.json();
    return data.consent;
  },

  /**
   * Update consent preferences
   */
  async updateConsent(
    token: string,
    analytics: boolean,
    marketing: boolean
  ): Promise<ConsentStatus> {
    const response = await fetch(`${API_BASE_URL}/api/gdpr/consent`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analytics, marketing }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la mise à jour du consentement');
    }

    const data = await response.json();
    return data.consent;
  },

  /**
   * Delete account (GDPR Article 17 - Right to erasure)
   * DANGEROUS: This is irreversible!
   */
  async deleteAccount(token: string, confirmation: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/gdpr/delete-account`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ confirmation }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la suppression du compte');
    }
  },

  /**
   * Get data retention policy (public)
   */
  async getRetentionPolicy(): Promise<RetentionPolicy> {
    const response = await fetch(`${API_BASE_URL}/api/gdpr/retention-policy`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la récupération de la politique');
    }

    const data = await response.json();
    return data.policy;
  },
};
