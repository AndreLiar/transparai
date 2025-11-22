import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { DataExportButton, DeleteAccountModal, ConsentManager } from '@/components/GDPR';
import { SessionList, FailedAttemptsCard } from '@/components/Security';
import { useTranslation } from 'react-i18next';
import '@/styles/Layout.css';
import './PrivacySettings.css';

const PrivacySettings: React.FC = () => {
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'privacy' | 'sessions'>('privacy');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('privacy.title', 'Confidentialité et Sécurité')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {t('privacy.description', 'Gérez vos données personnelles, votre confidentialité et la sécurité de votre compte')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === 'privacy'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('privacy.privacyTab', 'Confidentialité')}
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === 'sessions'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {t('privacy.sessionsTab', 'Sessions actives')}
            </button>
          </div>

          {/* Privacy Tab Content */}
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              {/* GDPR Rights Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  📋 {t('privacy.yourRights', 'Vos droits RGPD')}
                </h3>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  {t('privacy.rightsDescription', 'Conformément au RGPD, vous disposez d\'un droit d\'accès, de rectification, de suppression et de portabilité de vos données personnelles.')}
                </p>
              </div>

              {/* Consent Management */}
              <ConsentManager />

              {/* Data Export */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  {t('privacy.dataExport', 'Exportation de données')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {t('privacy.dataExportDescription', 'Téléchargez une copie complète de toutes vos données en format JSON.')}
                </p>
                <DataExportButton />
              </div>

              {/* Danger Zone - Delete Account */}
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2 text-red-900 dark:text-red-100">
                  ⚠️ {t('privacy.dangerZone', 'Zone dangereuse')}
                </h3>
                <p className="text-red-800 dark:text-red-200 mb-4">
                  {t('privacy.deleteAccountWarning', 'La suppression de votre compte est permanente et irréversible. Toutes vos données seront supprimées.')}
                </p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  {t('privacy.deleteAccount', 'Supprimer mon compte')}
                </button>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                  {t('privacy.needHelp', 'Besoin d\'aide ?')}
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <p>
                    <strong>{t('privacy.dpo', 'Délégué à la protection des données (DPO)')}:</strong>{' '}
                    <a href="mailto:dpo@transparai.com" className="text-blue-600 hover:underline">
                      dpo@transparai.com
                    </a>
                  </p>
                  <p>
                    <strong>{t('privacy.privacyEmail', 'Questions de confidentialité')}:</strong>{' '}
                    <a href="mailto:privacy@transparai.com" className="text-blue-600 hover:underline">
                      privacy@transparai.com
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sessions Tab Content */}
          {activeTab === 'sessions' && (
            <div className="space-y-6">
              <SessionList />
              <FailedAttemptsCard />
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </div>
  );
};

export default PrivacySettings;
