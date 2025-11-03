// src/services/historyService.ts
export interface Analysis {
  _id: string;
  date: string;
  source: string;
  summary: string;
  score: string;
  clauses: string[];
}

export const fetchUserAnalyses = async (token: string): Promise<Analysis[]> => {
  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Erreur chargement historique');
  }

  const data = await res.json();
  return data.analyses; // ✅ assuming backend returns .analyses in /dashboard
};
