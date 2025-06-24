//src/screens/upgrade/Upgrade.tsx

// src/screens/upgrade/Upgrade.tsx

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import { createCheckoutSession } from '@/services/upgradeService';
import '@/styles/Layout.css';
import './Upgrade.css';

const Upgrade: React.FC = () => {
  const { user } = useAuth();
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
      setError(err.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="upgrade-main">
        <h1 className="upgrade-title">🚀 Mettre à niveau votre plan</h1>
        <p className="upgrade-sub">Choisissez un plan pour débloquer davantage d'analyses.</p>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="plans-container">
          <div className="plan-card">
            <div className="plan-header">
              <span className="plan-icon">🔒</span>
              <h3 className="plan-name">Plan Standard</h3>
            </div>
            <p className="plan-desc">10 analyses / jour</p>
            <p className="plan-price">2€/mois</p>
            <button
              disabled={loading}
              className="plan-btn standard"
              onClick={() => handleUpgrade('standard')}
            >
              {loading ? 'Redirection...' : 'Passer au Standard'}
            </button>
          </div>

          <div className="plan-card">
            <div className="plan-header">
              <span className="plan-icon">🌟</span>
              <h3 className="plan-name">Plan Premium</h3>
            </div>
            <p className="plan-desc">Analyses illimitées</p>
            <p className="plan-price">5€/mois</p>
            <button
              disabled={loading}
              className="plan-btn premium"
              onClick={() => handleUpgrade('premium')}
            >
              {loading ? 'Redirection...' : 'Passer au Premium'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Upgrade;
