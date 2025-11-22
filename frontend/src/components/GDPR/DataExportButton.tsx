// frontend/src/components/GDPR/DataExportButton.tsx
import React, { useState } from 'react';
import { gdprService } from '@/services/gdprService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export const DataExportButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleExport = async () => {
    if (!user) {
      alert(t('errors.notAuthenticated', 'Vous devez être connecté'));
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const blob = await gdprService.exportUserData(token);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transparai-data-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert(t('gdpr.exportSuccess', 'Vos données ont été exportées avec succès !'));
    } catch (error) {
      console.error('Export failed:', error);
      alert(t('gdpr.exportError', 'Échec de l\'exportation des données'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {loading 
        ? t('gdpr.exporting', 'Exportation...') 
        : t('gdpr.exportData', 'Exporter mes données')}
    </button>
  );
};
