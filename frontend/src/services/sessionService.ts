// frontend/src/services/sessionService.ts
import { API_BASE_URL } from '@/config/api';

export interface Session {
  _id: string;
  firebaseUid: string;
  sessionToken: string;
  deviceInfo: {
    userAgent: string;
    ip: string;
    platform?: string;
    browser?: string;
  };
  createdAt: string;
  lastActivity: string;
  expiresAt: string;
  isActive: boolean;
}

export interface FailedAttempt {
  identifier: string;
  ip: string;
  attemptedAt: string;
  reason: string;
}

export const sessionService = {
  /**
   * Get all active sessions for current user
   */
  async getActiveSessions(token: string): Promise<Session[]> {
    const response = await fetch(`${API_BASE_URL}/api/session/active`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la récupération des sessions');
    }

    const data = await response.json();
    return data.sessions;
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(token: string, sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/session/revoke/${sessionId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la révocation de la session');
    }
  },

  /**
   * Revoke all other sessions (keep current)
   */
  async revokeAllOtherSessions(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/session/revoke-all`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la révocation des sessions');
    }
  },

  /**
   * Logout current session
   */
  async logout(token: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/session/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la déconnexion');
    }
  },

  /**
   * Get recent failed login attempts
   */
  async getFailedAttempts(token: string): Promise<FailedAttempt[]> {
    const response = await fetch(`${API_BASE_URL}/api/session/failed-attempts`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Échec de la récupération des tentatives');
    }

    const data = await response.json();
    return data.attempts;
  },
};
