// src/config/api.ts
const resolvedApiBaseUrl = import.meta.env.VITE_API_BASE_URL
  || import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? 'http://localhost:5001' : '');

if (import.meta.env.PROD && !resolvedApiBaseUrl) {
  throw new Error('Missing VITE_API_BASE_URL in production build');
}

export const API_BASE_URL = resolvedApiBaseUrl;

export const API_ENDPOINTS = {
  analyze: '/api/analyze',
  profile: '/api/profile',
  dashboard: '/api/dashboard',
  export: '/api/export',
  stripe: '/api/stripe',
  user: '/api/user',
  aiSettings: '/api/ai-settings',
  gdpr: '/api/gdpr',
  watch: '/api/watch',
} as const;
