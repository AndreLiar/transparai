// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  analyze: '/api/analyze',
  profile: '/api/profile',
  dashboard: '/api/dashboard',
  export: '/api/export',
  stripe: '/api/stripe',
  user: '/api/user',
  support: '/api/support',
  collaboration: '/api/collaboration',
  organization: '/api/organization',
  userManagement: '/api/user-management',
  documents: '/api/documents',
  comparative: '/api/comparative',
  analytics: '/api/analytics',
  contact: '/api/contact'
} as const;