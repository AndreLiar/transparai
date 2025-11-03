// src/services/collaborationService.ts

export interface SharedAnalysis {
  id: string;
  title: string;
  description: string;
  analysisType: 'single' | 'comparative';
  status: 'draft' | 'shared' | 'under_review' | 'approved' | 'published' | 'archived';
  tags: string[];
  sharedBy: {
    name: string;
    email: string;
  };
  viewCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SharedAnalysisDetails extends SharedAnalysis {
  analysisId: string;
  allowComments: boolean;
  requiresApproval: boolean;
  comments: {
    id: string;
    content: string;
    author: {
      name: string;
      email: string;
    };
    createdAt: string;
    updatedAt: string;
  }[];
  approvalWorkflow: {
    approverId: string;
    approverName: string;
    status: 'pending' | 'approved' | 'rejected' | 'needs_revision';
    comment: string;
    createdAt: string;
  }[];
  permissions: {
    canComment: boolean;
    canApprove: boolean;
  };
}

export interface ShareAnalysisRequest {
  analysisId: string;
  analysisType: 'single' | 'comparative';
  title: string;
  description?: string;
  tags?: string[];
  sharedWith?: 'organization' | 'managers' | 'specific_users';
  specificUsers?: string[];
  allowComments?: boolean;
  requiresApproval?: boolean;
}

// Share an analysis with the team
export const shareAnalysis = async (
  token: string,
  shareRequest: ShareAnalysisRequest
): Promise<{ message: string; sharedAnalysis: any }> => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/collaboration/share`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(shareRequest),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du partage de l\'analyse');
  }

  return response.json();
};

// Get shared analyses for user's organization
export const getSharedAnalyses = async (
  token: string,
  options: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{
  sharedAnalyses: SharedAnalysis[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}> => {
  const queryParams = new URLSearchParams();
  if (options.status) queryParams.append('status', options.status);
  if (options.page) queryParams.append('page', options.page.toString());
  if (options.limit) queryParams.append('limit', options.limit.toString());

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/collaboration/shared?${queryParams}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des analyses partagées');
  }

  return response.json();
};

// Get specific shared analysis details
export const getSharedAnalysisDetails = async (
  token: string,
  analysisId: string
): Promise<SharedAnalysisDetails> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/collaboration/shared/${analysisId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la récupération des détails de l\'analyse');
  }

  return response.json();
};

// Add comment to shared analysis
export const addComment = async (
  token: string,
  analysisId: string,
  content: string
): Promise<{
  message: string;
  comment: {
    id: string;
    content: string;
    author: {
      name: string;
      email: string;
    };
    createdAt: string;
  };
}> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/collaboration/shared/${analysisId}/comments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de l\'ajout du commentaire');
  }

  return response.json();
};