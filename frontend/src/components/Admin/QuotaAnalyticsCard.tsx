// frontend/src/components/Admin/QuotaAnalyticsCard.tsx
import React, { useState, useEffect } from 'react';
import { adminService, QuotaAnalytics } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';

export const QuotaAnalyticsCard: React.FC = () => {
  const [analytics, setAnalytics] = useState<QuotaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    loadAnalytics();
  }, [user]);

  const loadAnalytics = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = await user.getIdToken();
      const data = await adminService.getQuotaAnalytics(token);
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load quota analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !analytics) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'high': return 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          📊 {t('admin.quotaAnalytics', 'Analytics des Quotas')}
        </h3>
        <button
          onClick={loadAnalytics}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          🔄 {t('admin.refresh', 'Actualiser')}
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.totalUsers', 'Utilisateurs')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.totalUsers.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.totalAnalyses', 'Analyses')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.totalAnalyses.toLocaleString()}
          </div>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.avgUtilization', 'Utilisation moy.')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.avgUtilizationRate.toFixed(1)}%
          </div>
        </div>

        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            {t('admin.nearLimit', 'Près limite')}
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {analytics.summary.usersNearLimit}
          </div>
        </div>
      </div>

      {/* Plan Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          {t('admin.byPlan', 'Par plan')}
        </h4>
        <div className="space-y-3">
          {analytics.planBreakdown.map((plan) => (
            <div key={plan._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900 dark:text-white uppercase">
                  {plan._id}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {plan.totalUsers} {t('admin.users', 'utilisateurs')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <div className="text-gray-600 dark:text-gray-400">{t('admin.analyses', 'Analyses')}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{plan.totalAnalyses}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">{t('admin.avgPerUser', 'Moy/user')}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{plan.avgAnalysesPerUser.toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-gray-600 dark:text-gray-400">{t('admin.utilization', 'Utilisation')}</div>
                  <div className="font-semibold text-gray-900 dark:text-white">{plan.utilizationRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Users Near Limit */}
      {analytics.usersNearLimit.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('admin.usersNearLimit', 'Utilisateurs près de la limite')}
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.usersNearLimit.map((user, index) => (
              <div key={index} className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{user.email}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {user.plan} - {user.currentUsage.analyses}/{user.quotaLimit} analyses
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {user.utilizationRate.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analytics.recommendations.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            {t('admin.recommendations', 'Recommandations')}
          </h4>
          <div className="space-y-3">
            {analytics.recommendations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg ${getPriorityColor(rec.priority)}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {rec.type === 'quota_management' ? '📊' :
                     rec.type === 'user_engagement' ? '👥' :
                     rec.type === 'system_health' ? '⚡' :
                     '🎯'}
                  </span>
                  <div className="flex-1">
                    <div className="font-semibold mb-1">{rec.message}</div>
                    <div className="text-sm opacity-90">{rec.action}</div>
                    <div className="text-xs mt-2 uppercase font-semibold">
                      {rec.priority}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-right">
        {t('admin.generatedAt', 'Généré le')}: {new Date(analytics.summary.generatedAt).toLocaleString()}
      </div>
    </div>
  );
};
