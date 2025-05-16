// src/services/dashboardService.ts
export interface InfoData {
    quota: { used: number; limit: number };
    plan: string;
  }
  
  export const fetchDashboardData = async (token: string): Promise<InfoData> => {
    const res = await fetch('/api/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  
    if (!res.ok) {
      throw new Error('Erreur de récupération des informations.');
    }
  
    const fullData = await res.json();
    return {
      quota: fullData.quota,
      plan: fullData.plan,
    };
  };
  