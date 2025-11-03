// src/services/dashboardService.ts
import { API_BASE_URL } from '@/config/api';

export interface InfoData {
    quota: { used: number; limit: number; remaining: number };
    plan: string;
    planConfig?: any;
    features?: any;
    upgradeRecommendation?: any;
    profileComplete?: boolean;
  }
  
  export const fetchDashboardData = async (token: string): Promise<InfoData> => {
    const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
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
      planConfig: fullData.planConfig,
      features: fullData.features,
      upgradeRecommendation: fullData.upgradeRecommendation,
    };
  };
  