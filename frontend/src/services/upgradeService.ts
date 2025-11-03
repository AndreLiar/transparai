// src/services/upgradeService.ts
import { API_BASE_URL } from '@/config/api';

export const createCheckoutSession = async (token: string, plan: 'standard' | 'premium' | 'enterprise'): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/api/stripe/create-checkout-session`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ plan }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Échec de la création de la session Stripe.');
  }

  return data.url; // Stripe Checkout URL to redirect the user
};
