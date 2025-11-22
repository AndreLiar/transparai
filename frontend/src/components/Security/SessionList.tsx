// frontend/src/components/Security/SessionList.tsx
import React, { useState, useEffect } from 'react';
import { sessionService, Session } from '@/services/sessionService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export const SessionList: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadSessions();
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await sessionService.getActiveSessions(token);
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (sessionId: string) => {
    if (!window.confirm(t('security.confirmRevoke', 'Révoquer cette session ?'))) {
      return;
    }

    if (!user) return;

    try {
      const token = await user.getIdToken();
      await sessionService.revokeSession(token, sessionId);
      setSessions(sessions.filter(s => s._id !== sessionId));
      alert(t('security.revokeSuccess', 'Session révoquée'));
    } catch (error) {
      console.error('Failed to revoke:', error);
      alert(t('security.revokeError', 'Échec de la révocation'));
    }
  };

  const handleRevokeAll = async () => {
    if (!window.confirm(t('security.confirmRevokeAll', 'Révoquer toutes les autres sessions ?'))) {
      return;
    }

    if (!user) return;

    try {
      const token = await user.getIdToken();
      await sessionService.revokeAllOtherSessions(token);
      await loadSessions();
      alert(t('security.revokeAllSuccess', 'Toutes les autres sessions ont été révoquées'));
    } catch (error) {
      console.error('Failed to revoke all:', error);
      alert(t('security.revokeAllError', 'Échec de la révocation'));
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
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {t('security.activeSessions', 'Sessions actives')} ({sessions.length}/3)
        </h3>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
          >
            {t('security.revokeAllOther', 'Révoquer toutes les autres')}
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          {t('security.noSessions', 'Aucune session active')}
        </p>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <strong className="text-gray-900 dark:text-white">
                    {session.deviceInfo.browser || t('security.unknownBrowser', 'Navigateur inconnu')}
                  </strong>
                  {session.deviceInfo.platform && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      - {session.deviceInfo.platform}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  <span className="block">IP: {session.deviceInfo.ip}</span>
                  <span className="block">
                    {t('security.lastActivity', 'Dernière activité')}: {new Date(session.lastActivity).toLocaleString()}
                  </span>
                  <span className="block">
                    {t('security.createdAt', 'Créée le')}: {new Date(session.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleRevoke(session._id)}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                {t('security.revoke', 'Révoquer')}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>{t('security.sessionNote', 'Note:')}</strong> {t('security.sessionNoteText', 'Vous êtes limité à 3 sessions actives simultanées. Les anciennes sessions sont automatiquement révoquées après 7 jours d\'inactivité.')}
        </p>
      </div>
    </div>
  );
};
