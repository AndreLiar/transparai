// frontend/src/components/Security/FailedAttemptsCard.tsx
import React, { useState, useEffect } from 'react';
import { sessionService, FailedAttempt } from '@/services/sessionService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export const FailedAttemptsCard: React.FC = () => {
  const [attempts, setAttempts] = useState<FailedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadAttempts();
  }, [user]);

  const loadAttempts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await sessionService.getFailedAttempts(token);
      setAttempts(data);
    } catch (error) {
      console.error('Failed to load attempts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        🚨 {t('security.failedAttempts', 'Tentatives de connexion échouées')}
      </h3>

      {attempts.length === 0 ? (
        <div className="text-center py-8">
          <span className="text-6xl mb-4 block">✅</span>
          <p className="text-gray-600 dark:text-gray-400">
            {t('security.noFailedAttempts', 'Aucune tentative de connexion échouée récente')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {t('security.noFailedAttemptsNote', 'Votre compte est sécurisé')}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <p className="text-sm text-orange-800 dark:text-orange-200">
              <strong>{t('security.securityWarning', 'Attention:')}</strong>{' '}
              {t('security.failedAttemptsWarning', 'Des tentatives de connexion échouées ont été détectées sur votre compte. Si ce n\'est pas vous, changez votre mot de passe immédiatement.')}
            </p>
          </div>

          <div className="space-y-3">
            {attempts.map((attempt, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⚠️</span>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {attempt.reason}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {t('security.attemptFrom', 'Depuis')}: <span className="font-mono">{attempt.ip}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(attempt.attemptedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              🛡️ {t('security.protectYourAccount', 'Protégez votre compte')}
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• {t('security.tip1', 'Utilisez un mot de passe fort et unique')}</li>
              <li>• {t('security.tip2', 'Ne partagez jamais votre mot de passe')}</li>
              <li>• {t('security.tip3', 'Activez l\'authentification à deux facteurs si disponible')}</li>
              <li>• {t('security.tip4', 'Vérifiez régulièrement vos sessions actives')}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};
