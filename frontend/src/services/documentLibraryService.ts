// src/services/documentLibraryService.ts

export interface DocumentLibraryItem {
  id: string;
  name: string;
  originalName: string;
  source: 'upload' | 'ocr';
  fileType: string;
  sizeBytes?: number;
  pageCount?: number;
  usageCount: number;
  lastUsed: string;
  createdAt: string;
  isOwnDocument: boolean;
  owner?: {
    name: string;
  };
}

export interface DocumentLibraryDetails extends DocumentLibraryItem {
  extractedText: string;
}

export interface DocumentLibraryResponse {
  documents: DocumentLibraryItem[];
  pagination: {
    current: number;
    total: number;
    count: number;
    totalItems: number;
  };
}

export interface DocumentLibraryOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'lastUsed' | 'createdAt' | 'name' | 'usageCount';
  sortOrder?: 'desc' | 'asc';
  includeOrgDocs?: boolean;
}

// Get user's document library
export const getDocumentLibrary = async (
  token: string,
  options: DocumentLibraryOptions = {}
): Promise<DocumentLibraryResponse> => {
  const queryParams = new URLSearchParams();
  
  if (options.page) queryParams.append('page', options.page.toString());
  if (options.limit) queryParams.append('limit', options.limit.toString());
  if (options.search) queryParams.append('search', options.search);
  if (options.sortBy) queryParams.append('sortBy', options.sortBy);
  if (options.sortOrder) queryParams.append('sortOrder', options.sortOrder);
  if (options.includeOrgDocs) queryParams.append('includeOrgDocs', 'true');

  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/library?${queryParams}`,
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
    throw new Error(errorData.message || 'Erreur lors de la récupération de la bibliothèque');
  }

  return response.json();
};

// Get specific document content
export const getDocumentContent = async (
  token: string,
  documentId: string
): Promise<DocumentLibraryDetails> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/library/${documentId}`,
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
    throw new Error(errorData.message || 'Erreur lors de la récupération du document');
  }

  return response.json();
};

// Delete document from library
export const deleteDocument = async (
  token: string,
  documentId: string
): Promise<{ message: string }> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/library/${documentId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors de la suppression du document');
  }

  return response.json();
};

// Share/unshare document with organization
export const toggleDocumentSharing = async (
  token: string,
  documentId: string,
  share: boolean
): Promise<{ message: string }> => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/documents/library/${documentId}/share`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ share }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Erreur lors du partage du document');
  }

  return response.json();
};