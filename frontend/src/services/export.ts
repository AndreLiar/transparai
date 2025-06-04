//src/services/export.ts
export const exportAnalysisPdf = async (token: string, analysisId: string) => {
  const response = await fetch(`/api/export/${analysisId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Échec de l’exportation du PDF');
  }

  const blob = await response.blob();
  return blob; // 📄 Return the PDF Blob for download
};
