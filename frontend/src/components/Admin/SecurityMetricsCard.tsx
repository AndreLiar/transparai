// frontend/src/components/Admin/SecurityMetricsCard.tsx
import React, { useState, useEffect } from 'react';
import { adminService, SecurityMetrics } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export const SecurityMetricsCard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await adminService.getSecurityMetrics(token);
      setMetrics(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load security metrics:', err);
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="text-red-600 dark:text-red-400">
          <p className="font-semibold">{t('admin.loadError', 'Erreur de chargement')}</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  const getAlertLevel = (attempts: number) => {
    if (attempts > 50) return { color: 'red', label: 'Critique' };
    if (attempts > 20) return { color: 'yellow', label: 'Attention' };
    return { color: 'green', label: 'Normal' };
  };

  const alert15min = getAlertLevel(metrics.recentAttempts.last15Minutes);
  const alert24h = getAlertLevel(metrics.recentAttempts.last24Hours);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          🔒 {t('admin.securityMetrics', 'Métriques de Sécurité')}
        </h3>
        <button
          onClick={loadMetrics}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          🔄 {t('admin.refresh', 'Actualiser')}
        </button>
      </div>

      {/* Recent Attempts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-4 rounded-lg border-2 ${
          alert15min.color === 'red' ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' :
          alert15min.color === 'yellow' ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
          'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
        }`}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.last15Minutes', 'Dernières 15 minutes')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.recentAttempts.last15Minutes}
          </div>
          <div className="text-xs mt-1 font-semibold" style={{ color: alert15min.color }}>
            {alert15min.label}
          </div>
        </div>

        <div className={`p-4 rounded-lg border-2 ${
          alert24h.color === 'red' ? 'bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700' :
          alert24h.color === 'yellow' ? 'bg-yellow-50 border-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-700' :
          'bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700'
        }`}>
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.last24Hours', 'Dernières 24 heures')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.recentAttempts.last24Hours}
          </div>
          <div className="text-xs mt-1 font-semibold" style={{ color: alert24h.color }}>
            {alert24h.label}
          </div>
        </div>
      </div>

      {/* Attempts by Type */}
      {metrics.attemptsByType.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('admin.attemptsByType', 'Tentatives par type')}
          </h4>
          <div className="space-y-2">
            {metrics.attemptsByType.map((attempt) => (
              <div key={attempt._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-gray-700 dark:text-gray-300">{attempt._id}</span>
                <span className="font-semibold text-gray-900 dark:text-white">{attempt.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Failed IPs */}
      {metrics.topFailedIPs.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('admin.topFailedIPs', 'IPs avec le plus d\'échecs')}
          </h4>
          <div className="space-y-2">
            {metrics.topFailedIPs.slice(0, 5).map((ip) => (
              <div key={ip._id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <span className="text-gray-900 dark:text-white font-mono">{ip._id}</span>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {t('admin.lastAttempt', 'Dernière tentative')}: {new Date(ip.lastAttempt).toLocaleString()}
                  </div>
                </div>
                <span className="font-semibold text-red-600 dark:text-red-400">{ip.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Locked Accounts */}
      <div className={`p-4 rounded-lg ${
        metrics.lockedAccounts.count > 0 
          ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800' 
          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
      }`}>
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700 dark:text-gray-300">
            {t('admin.lockedAccounts', 'Comptes verrouillés')}
          </span>
          <span className={`text-2xl font-bold ${
            metrics.lockedAccounts.count > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {metrics.lockedAccounts.count}
          </span>
        </div>
      </div>

      {/* Timestamp */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
        {t('admin.lastUpdate', 'Dernière mise à jour')}: {new Date(metrics.timestamp).toLocaleString()}
      </div>
    </div>
  );
};
