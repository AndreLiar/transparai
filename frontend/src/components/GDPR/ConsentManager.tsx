// frontend/src/components/GDPR/ConsentManager.tsx
import React, { useState, useEffect } from 'react';
import { gdprService } from '@/services/gdprService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export const ConsentManager: React.FC = () => {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadConsent();
  }, [user]);

  const loadConsent = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const consent = await gdprService.getConsent(token);
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
      setLastUpdated(consent.lastUpdated);
    } catch (error) {
      console.error('Failed to load consent:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert(t('errors.notAuthenticated', 'Vous devez être connecté'));
      return;
    }

    try {
      setSaving(true);
      const token = await user.getIdToken();
      const updatedConsent = await gdprService.updateConsent(token, analytics, marketing);
      setLastUpdated(updatedConsent.lastUpdated);
      alert(t('gdpr.consentSaved', 'Préférences enregistrées'));
    } catch (error) {
      console.error('Failed to save consent:', error);
      alert(t('gdpr.consentSaveError', 'Échec de l\'enregistrement'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          {t('gdpr.consentManagement', 'Gestion des consentements')}
        </h3>

        {lastUpdated && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('gdpr.lastUpdated', 'Dernière mise à jour')}: {new Date(lastUpdated).toLocaleDateString()}
          </p>
        )}

        <div className="space-y-4">
          {/* Analytics Consent */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <input
              type="checkbox"
              id="analytics-consent"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="analytics-consent" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                {t('gdpr.analyticsConsent', 'Analytique et amélioration du service')}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('gdpr.analyticsDescription', 'Nous aide à comprendre comment vous utilisez l\'application et à l\'améliorer')}
              </p>
            </div>
          </div>

          {/* Marketing Consent */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <input
              type="checkbox"
              id="marketing-consent"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
              className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex-1">
              <label htmlFor="marketing-consent" className="font-medium text-gray-900 dark:text-white cursor-pointer">
                {t('gdpr.marketingConsent', 'Communications marketing')}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('gdpr.marketingDescription', 'Recevoir des informations sur les nouvelles fonctionnalités et offres')}
              </p>
            </div>
          </div>

          {/* Required Consent (Disabled) */}
          <div className="flex items-start space-x-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50">
            <input
              type="checkbox"
              id="required-consent"
              checked
              disabled
              className="mt-1 h-5 w-5 text-gray-400 border-gray-300 rounded cursor-not-allowed"
            />
            <div className="flex-1">
              <label htmlFor="required-consent" className="font-medium text-gray-700 dark:text-gray-300">
                {t('gdpr.requiredConsent', 'Traitement des données (requis)')}
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('gdpr.requiredDescription', 'Nécessaire pour le fonctionnement du service. Ne peut pas être désactivé.')}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving 
            ? t('gdpr.saving', 'Enregistrement...') 
            : t('gdpr.savePreferences', 'Enregistrer les préférences')}
        </button>
      </div>
    </div>
  );
};
