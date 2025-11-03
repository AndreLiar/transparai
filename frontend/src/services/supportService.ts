// Support service for Standard/Premium users
export interface SupportInfo {
  hasPrioritySupport: boolean;
  plan: string;
  features: {
    [key: string]: {
      support: string;
      responseTime: string;
      channels: string[];
      features?: string[];
    };
  };
}

export interface SupportRequest {
  subject: string;
  message: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
}

export interface SupportResponse {
  success: boolean;
  message: string;
  priority: string;
  estimatedResponse: string;
  ticketId: string;
}

export const getSupportInfo = async (token: string): Promise<SupportInfo> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/support/info`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur lors de la récupération des informations de support');
  }

  return response.json();
};

export const sendPrioritySupport = async (token: string, supportRequest: SupportRequest): Promise<SupportResponse> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/support/priority`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(supportRequest),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Erreur lors de l\'envoi de la demande de support');
  }

  return response.json();
};