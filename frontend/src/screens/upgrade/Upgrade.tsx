//src/screens/upgrade/Upgrade.tsx

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import { createCheckoutSession } from '@/services/upgradeService';
import '@/styles/Layout.css';

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
      window.location.href = checkoutUrl; // ⏩ Redirect to Stripe
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

      <div className="dashboard-main">
        <h2 className="mb-4">🚀 Mettre à niveau votre plan</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card p-4 mb-4">
          <h4>🔓 Plan Standard</h4>
          <p>10 analyses / jour — 2€/mois</p>
          <button
            disabled={loading}
            className="btn btn-primary"
            onClick={() => handleUpgrade('standard')}
          >
            {loading ? 'Redirection...' : 'Passer au Standard'}
          </button>
        </div>

        <div className="card p-4">
          <h4>🌟 Plan Premium</h4>
          <p>Analyses illimitées — 5€/mois</p>
          <button
            disabled={loading}
            className="btn btn-success"
            onClick={() => handleUpgrade('premium')}
          >
            {loading ? 'Redirection...' : 'Passer au Premium'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Upgrade;
