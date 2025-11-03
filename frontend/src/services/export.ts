//src/services/export.ts
import { API_BASE_URL } from '@/config/api';

export const exportAnalysisPdf = async (token: string, analysisId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/export/${analysisId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('L\'exportation PDF necessite un abonnement payant. Passez a un plan superieur pour telecharger vos analyses.');
    }
    const errorText = await response.text();
    throw new Error(errorText || 'Echec de l\'exportation du PDF');
  }

  const blob = await response.blob();
  return blob; // 📄 Return the PDF Blob for download
};
