// src/services/aiSettingsService.ts
import { API_BASE_URL } from '../config/api';

export interface AISettings {
  preferredModel: 'auto' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'gemini';
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
  gptAnalyses: number;
  geminiAnalyses: number;
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
  console.log('🌐 Making API call to:', `${API_BASE_URL}/api/ai-settings`);
  console.log('🔑 Using token:', token ? 'Token present' : 'No token');
  
  const response = await fetch(`${API_BASE_URL}/api/ai-settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  console.log('📡 Response status:', response.status, response.statusText);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ API Error:', errorText);
    throw new Error(`Failed to fetch AI settings: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  console.log('📥 Response data:', data);
  return data;
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
    name: 'Auto (Recommended)',
    description: 'Automatically selects the best model based on document complexity and your budget',
    cost: 'Variable',
    icon: '🤖'
  },
  'gemini': {
    name: 'Gemini 2.0 Flash',
    description: 'Fast and free AI model, good for basic analysis',
    cost: 'Free',
    icon: '⚡'
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    description: 'Balanced performance and cost, good for most documents',
    cost: '$0.003/1K tokens',
    icon: '🚀'
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    description: 'Most advanced model, best for complex legal documents',
    cost: '$0.015/1K tokens',
    icon: '⭐'
  }
} as const;

export const PLAN_FEATURES = {
  free: {
    budgetPerMonth: 0,
    availableModels: ['gemini'],
    description: 'Free Gemini AI only'
  },
  standard: {
    budgetPerMonth: 2,
    availableModels: ['auto', 'gemini', 'gpt-3.5-turbo'],
    description: '$2/month AI budget'
  },
  premium: {
    budgetPerMonth: 10,
    availableModels: ['auto', 'gemini', 'gpt-3.5-turbo', 'gpt-4-turbo'],
    description: '$10/month AI budget'
  },
  enterprise: {
    budgetPerMonth: 50,
    availableModels: ['auto', 'gemini', 'gpt-3.5-turbo', 'gpt-4-turbo'],
    description: '$50/month AI budget'
  }
} as const;