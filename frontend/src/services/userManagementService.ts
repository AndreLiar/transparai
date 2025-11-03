// src/services/userManagementService.ts
export interface Invitation {
  id: string;
  email: string;
  role: 'admin' | 'manager' | 'analyst' | 'viewer';
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  invitedBy: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  createdAt: string;
  expiresAt: string;
}

export interface AuditLog {
  _id: string;
  userId: {
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  action: string;
  details: any;
  metadata: {
    ipAddress?: string;
    userAgent?: string;
    targetUserId?: {
      email: string;
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  };
  createdAt: string;
}

export const inviteUser = async (
  token: string,
  organizationId: string,
  email: string,
  role: 'admin' | 'manager' | 'analyst' | 'viewer'
): Promise<{ invitation: Invitation }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-management/${organizationId}/invite`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'invitation');
  }

  return response.json();
};

export const acceptInvitation = async (
  token: string,
  invitationToken: string
): Promise<{ organization: any; role: string }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organization/accept-invitation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: invitationToken }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'acceptation de l\'invitation');
  }

  return response.json();
};

export const changeUserRole = async (
  token: string,
  organizationId: string,
  targetUserId: string,
  newRole: 'admin' | 'manager' | 'analyst' | 'viewer'
): Promise<{ userId: string; oldRole: string; newRole: string }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-management/${organizationId}/change-role`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetUserId, newRole }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du changement de rôle');
  }

  return response.json();
};

export const removeUser = async (
  token: string,
  organizationId: string,
  targetUserId: string
): Promise<{ userId: string; email: string }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-management/${organizationId}/remove-user`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetUserId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression de l\'utilisateur');
  }

  return response.json();
};

export const getPendingInvitations = async (
  token: string,
  organizationId: string
): Promise<{ invitations: Invitation[] }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-management/${organizationId}/pending-invitations`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des invitations');
  }

  return response.json();
};

export const cancelInvitation = async (
  token: string,
  organizationId: string,
  invitationId: string
): Promise<void> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-management/${organizationId}/cancel-invitation`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ invitationId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'annulation de l\'invitation');
  }
};

export const getAuditLogs = async (
  token: string,
  organizationId: string,
  page: number = 1,
  limit: number = 50,
  action?: string
): Promise<{ logs: AuditLog[]; pagination: any }> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    ...(action && { action })
  });

  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user-management/${organizationId}/audit-logs?${params}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des logs d\'audit');
  }

  return response.json();
};