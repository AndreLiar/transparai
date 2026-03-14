// src/services/aiSettingsService.ts
import { API_BASE_URL } from '../config/api';

export interface AISettings {
  preferredModel: 'auto' | 'gpt-4o' | 'gpt-4o-mini';
  allowPremiumAI: boolean;
  monthlyAIBudget: {
    allocated: number;
    used: number;
    remaining: number;
    lastReset: string;
  };
}

export interface AIUsageStats {
  totalAnalyses: number;
  gpt4oAnalyses: number;
  gpt4oMiniAnalyses: number;
  totalAICost: number;
  lastUpdated: string;
}

export interface AISettingsResponse {
  success: boolean;
  data: {
    aiSettings: AISettings;
    aiUsageStats: AIUsageStats;
    plan: string;
    planBudget: number;
  };
}

export const getAISettings = async (token: string): Promise<AISettingsResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/ai-settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch AI settings: ${response.status} ${errorText}`);
  }

  return response.json();
};

export const updateAISettings = async (
  token: string, 
  settings: Partial<Pick<AISettings, 'preferredModel' | 'allowPremiumAI'>>
): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/api/ai-settings`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error('Failed to update AI settings');
  }

  return response.json();
};

export const MODEL_INFO = {
  'auto': {
    name: 'Auto (Recommandé)',
    description: 'Sélectionne automatiquement le meilleur modèle selon la complexité du document et votre budget',
    cost: 'Variable',
    icon: '🤖'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    description: 'Modèle rapide et économique, idéal pour la plupart des documents',
    cost: '$0.0003/1K tokens',
    icon: '🚀'
  },
  'gpt-4o': {
    name: 'GPT-4o',
    description: 'Modèle le plus avancé, optimal pour les documents juridiques complexes',
    cost: '$0.005/1K tokens',
    icon: '⭐'
  }
} as const;

export const PLAN_FEATURES = {
  free: {
    budgetPerMonth: 0.5,
    availableModels: ['gpt-4o-mini'],
    description: 'GPT-4o Mini (budget limité)'
  },
  standard: {
    budgetPerMonth: 3,
    availableModels: ['auto', 'gpt-4o-mini'],
    description: '$3/mois de budget IA'
  },
  premium: {
    budgetPerMonth: 15,
    availableModels: ['auto', 'gpt-4o-mini', 'gpt-4o'],
    description: '$15/mois de budget IA'
  },
  enterprise: {
    budgetPerMonth: 75,
    availableModels: ['auto', 'gpt-4o-mini', 'gpt-4o'],
    description: '$75/mois de budget IA'
  }
} as const;