// src/services/analyze.ts
import { API_BASE_URL } from '@/config/api';

export const analyzeCGA = async (token: string, text: string, source: 'upload' | 'ocr') => {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, source }),
  });

  if (response.status === 429) {
    const data = await response.json();
    return { quotaReached: true, message: data.message };
  }

  if (!response.ok) {
    throw new Error('Analyse échouée');
  }

  return response.json(); // { summary, score, clauses }
};
