import { API_BASE_URL } from '@/config/api';
// src/services/organizationService.ts
export interface Organization {
  _id: string;
  name: string;
  domain?: string;
  settings: {
    branding: {
      logo: string;
      primaryColor: string;
      secondaryColor: string;
      companyName: string;
    };
  };
  billing: {
    maxUsers: number;
    pricePerUser: number;
    billingCycle: 'monthly' | 'yearly';
  };
  usage: {
    currentUsers: number;
    totalAnalyses: number;
    monthlyAnalyses: number;
  };
  users?: Array<{
    id: string;
    email: string;
    name: string;
    role: string;
    joinedAt: string;
    analysesCount: number;
  }>;
  analytics?: {
    totalUsers: number;
    totalAnalyses: number;
    monthlyAnalyses: number;
    averageAnalysesPerUser: number;
  };
  userRole?: string;
}

export interface OrganizationBilling {
  currentUsers: number;
  maxUsers: number;
  pricePerUser: number;
  billingCycle: 'monthly' | 'yearly';
  costs: {
    monthly: number;
    yearly: number;
  };
  nextBillingDate: string;
  stripeCustomerId?: string;
}

export const createOrganization = async (
  token: string,
  orgData: {
    name: string;
    domain?: string;
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
      companyName?: string;
    };
  }
): Promise<{ organization: Organization }> => {
  const response = await fetch(`${API_BASE_URL/api/organization/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(orgData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la création de l\'organisation');
  }

  return response.json();
};

export const getMyOrganization = async (token: string): Promise<Organization> => {
  const response = await fetch(`${API_BASE_URL/api/organization/my-organization`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('NO_ORGANIZATION');
    }
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération de l\'organisation');
  }

  return response.json();
};

export const updateOrganizationSettings = async (
  token: string,
  organizationId: string,
  updates: {
    name?: string;
    domain?: string;
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
      companyName?: string;
    };
  }
): Promise<{ organization: Organization }> => {
  const response = await fetch(`${API_BASE_URL/api/organization/${organizationId}/settings`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la mise à jour des paramètres');
  }

  return response.json();
};

export const getOrganizationBilling = async (
  token: string,
  organizationId: string
): Promise<OrganizationBilling> => {
  const response = await fetch(`${API_BASE_URL/api/organization/${organizationId}/billing`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération de la facturation');
  }

  return response.json();
};