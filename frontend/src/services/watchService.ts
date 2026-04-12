// src/services/watchService.ts
import { API_BASE_URL } from '@/config/api';

export interface WatchedDocument {
  _id: string;
  name: string;
  url: string | null;
  lastSummary: string;
  lastScore: string;
  lastCheckedAt: string;
  lastChangedAt: string | null;
  changeCount: number;
  alertsEnabled: boolean;
  checkFrequency: 'weekly' | 'monthly';
  createdAt: string;
}

export interface DocumentChange {
  _id: string;
  watchedDocumentId: string;
  diffSummary: string;
  addedClauses: string[];
  removedClauses: string[];
  modifiedClauses: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  previousScore: string;
  newScore: string;
  detectedAt: string;
}

export interface WatchHistory {
  watch: WatchedDocument;
  changes: DocumentChange[];
}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
});

export const startWatch = async (
  token: string,
  payload: { name: string; analysisId: string; text: string; url?: string; checkFrequency?: 'weekly' | 'monthly' }
): Promise<{ watch: WatchedDocument; created: boolean }> => {
  const res = await fetch(`${API_BASE_URL}/api/watch`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erreur lors de la mise en surveillance');
  }
  return res.json();
};

export const getWatches = async (token: string): Promise<WatchedDocument[]> => {
  const res = await fetch(`${API_BASE_URL}/api/watch`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Erreur lors du chargement des surveillances');
  const data = await res.json();
  return data.watches;
};

export const deleteWatch = async (token: string, watchId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/watch/${watchId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error('Erreur lors de la suppression');
};

export const updateWatch = async (
  token: string,
  watchId: string,
  updates: Partial<Pick<WatchedDocument, 'alertsEnabled' | 'checkFrequency' | 'name'>>
): Promise<WatchedDocument> => {
  const res = await fetch(`${API_BASE_URL}/api/watch/${watchId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Erreur lors de la mise à jour');
  const data = await res.json();
  return data.watch;
};

export const getWatchHistory = async (token: string, watchId: string): Promise<WatchHistory> => {
  const res = await fetch(`${API_BASE_URL}/api/watch/${watchId}/history`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Erreur lors du chargement de l\'historique');
  return res.json();
};

export const manualCheck = async (
  token: string,
  watchId: string,
  text: string
): Promise<{ changed: boolean; changeRecord?: DocumentChange }> => {
  const res = await fetch(`${API_BASE_URL}/api/watch/${watchId}/check`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Erreur lors de la vérification');
  }
  return res.json();
};
