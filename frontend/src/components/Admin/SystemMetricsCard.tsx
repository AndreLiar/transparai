// frontend/src/components/Admin/SystemMetricsCard.tsx
import React, { useState, useEffect } from 'react';
import { adminService, SystemMetrics } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export const SystemMetricsCard: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [user]);

  const loadMetrics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await adminService.getSystemMetrics(token);
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load system metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
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

  if (!metrics) return null;

  const heapUsagePercent = (metrics.system.memory.heapUsed / metrics.system.memory.heapTotal) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          ⚙️ {t('admin.systemMetrics', 'Métriques Système')}
        </h3>
        <button
          onClick={loadMetrics}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          🔄 {t('admin.refresh', 'Actualiser')}
        </button>
      </div>

      {/* System Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.uptime', 'Temps de fonctionnement')}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatUptime(metrics.system.uptime)}
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.nodeVersion', 'Version Node.js')}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.system.nodeVersion}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {metrics.system.platform}
          </div>
        </div>
      </div>

      {/* Memory Usage */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t('admin.memoryUsage', 'Utilisation de la mémoire')}
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">RSS</span>
            <span className="font-mono text-gray-900 dark:text-white">{formatBytes(metrics.system.memory.rss)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Heap Total</span>
            <span className="font-mono text-gray-900 dark:text-white">{formatBytes(metrics.system.memory.heapTotal)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Heap Used</span>
            <span className="font-mono text-gray-900 dark:text-white">{formatBytes(metrics.system.memory.heapUsed)}</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  heapUsagePercent > 90 ? 'bg-red-600' :
                  heapUsagePercent > 70 ? 'bg-yellow-600' :
                  'bg-green-600'
                }`}
                style={{ width: `${heapUsagePercent}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {heapUsagePercent.toFixed(1)}% utilisé
            </div>
          </div>
        </div>
      </div>

      {/* Users */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.totalUsers', 'Utilisateurs totaux')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.users.total.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-teal-50 dark:bg-teal-900/20 rounded-lg text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.activeUsers24h', 'Actifs 24h')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {metrics.users.active24h}
          </div>
        </div>
      </div>

      {/* Errors */}
      <div className={`p-4 rounded-lg ${
        metrics.errors.last24h > 10
          ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
      }`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="font-semibold text-gray-700 dark:text-gray-300">
              {t('admin.errors24h', 'Erreurs (24h)')}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {metrics.errors.unresolved} {t('admin.unresolved', 'non résolues')}
            </div>
          </div>
          <span className={`text-3xl font-bold ${
            metrics.errors.last24h > 10 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
          }`}>
            {metrics.errors.last24h}
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
