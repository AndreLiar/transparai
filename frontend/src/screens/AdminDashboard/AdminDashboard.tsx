// frontend/src/screens/AdminDashboard/AdminDashboard.tsx
import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { SecurityMetricsCard, SystemMetricsCard, QuotaAnalyticsCard } from '@/components/Admin';
import { useTranslation } from 'react-i18next';
import '@/styles/Layout.css';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'security' | 'system' | 'quotas'>('security');

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">👨‍💼</span>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('admin.dashboard', 'Tableau de bord Admin')}
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              {t('admin.dashboardDescription', 'Surveillez la sécurité, les performances système et les analytics d\'utilisation')}
            </p>
          </div>

          {/* Admin Warning */}
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {t('admin.restrictedAccess', 'Accès restreint')}
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {t('admin.restrictedNote', 'Cette page contient des informations sensibles. Accès administrateur uniquement.')}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('security')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'security'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🔒 {t('admin.securityTab', 'Sécurité')}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'system'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              ⚙️ {t('admin.systemTab', 'Système')}
            </button>
            <button
              onClick={() => setActiveTab('quotas')}
              className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                activeTab === 'quotas'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              📊 {t('admin.quotasTab', 'Quotas')}
            </button>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'security' && (
              <div>
                <SecurityMetricsCard />
              </div>
            )}

            {activeTab === 'system' && (
              <div>
                <SystemMetricsCard />
              </div>
            )}

            {activeTab === 'quotas' && (
              <div>
                <QuotaAnalyticsCard />
              </div>
            )}
          </div>

          {/* Info Footer */}
          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              ℹ️ {t('admin.aboutMetrics', 'À propos des métriques')}
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• {t('admin.metricNote1', 'Les métriques de sécurité se rafraîchissent toutes les minutes')}</li>
              <li>• {t('admin.metricNote2', 'Les métriques système se rafraîchissent toutes les 30 secondes')}</li>
              <li>• {t('admin.metricNote3', 'Les analytics de quotas sont générées à la demande')}</li>
              <li>• {t('admin.metricNote4', 'Les données historiques sont disponibles dans les logs MongoDB')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
