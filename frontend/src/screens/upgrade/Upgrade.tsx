//src/screens/upgrade/Upgrade.tsx

// src/screens/upgrade/Upgrade.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import { createCheckoutSession } from '@/services/upgradeService';
import { useTranslation } from 'react-i18next';
import '@/styles/Layout.css';
import './Upgrade.css';

const Upgrade: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (plan: 'standard' | 'premium') => {
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      const token = await user.getIdToken();
      const checkoutUrl = await createCheckoutSession(token, plan);
      window.location.href = checkoutUrl;
    } catch (err: any) {
      setError(err.message || t('upgrade.error_unexpected'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="upgrade-main">
        <h1 className="upgrade-title">🚀 {t('upgrade.title')}</h1>
        <p className="upgrade-sub">{t('upgrade.subtitle')}</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="plans-container">
          <div className="plan-card">
            <div className="plan-header">
              <span className="plan-icon">🔒</span>
              <h3 className="plan-name">{t('upgrade.standard_title')}</h3>
            </div>
            <p className="plan-desc">{t('upgrade.standard_desc')}</p>
            <p className="plan-price">{t('upgrade.standard_price')}</p>
            <button
              disabled={loading}
              className="plan-btn standard"
              onClick={() => handleUpgrade('standard')}
            >
              {loading ? t('upgrade.redirecting') : t('upgrade.standard_button')}
            </button>
          </div>

          <div className="plan-card">
            <div className="plan-header">
              <span className="plan-icon">🌟</span>
              <h3 className="plan-name">{t('upgrade.premium_title')}</h3>
            </div>
            <p className="plan-desc">{t('upgrade.premium_desc')}</p>
            <p className="plan-price">{t('upgrade.premium_price')}</p>
            <button
              disabled={loading}
              className="plan-btn premium"
              onClick={() => handleUpgrade('premium')}
            >
              {loading ? t('upgrade.redirecting') : t('upgrade.premium_button')}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;

