// src/screens/upgrade/Upgrade.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import { createCheckoutSession } from '@/services/upgradeService';
import '@/styles/Layout.css';
import './Upgrade.css';

const CheckIcon: React.FC = () => (
  <svg className="up-check-icon" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const PLANS = [
  {
    key: 'standard' as const,
    name: 'Standard',
    price: '14,99 €',
    freq: '/mois',
    desc: 'Pour les particuliers actifs qui signent régulièrement des contrats.',
    features: [
      '100 analyses / mois',
      'Upload PDF & OCR',
      'Analyse IA avancée (GPT-4o mini)',
      'Historique 90 jours',
      'Export PDF',
      'Documents jusqu\u2019\u00e0 100\u202f000 caract\u00e8res',
    ],
    highlight: true,
    badge: 'Le Plus Populaire',
  },
  {
    key: 'premium' as const,
    name: 'Premium',
    price: '29,99 €',
    freq: '/mois',
    desc: 'Pour les professionnels, freelances et juristes indépendants.',
    features: [
      'Analyses illimit\u00e9es',
      'IA haute pr\u00e9cision (GPT-4o)',
      'Historique 2 ans',
      'Export PDF',
      'Support prioritaire',
    ],
    highlight: false,
    badge: null,
  },
  {
    key: 'enterprise' as const,
    name: 'Enterprise',
    price: '199 €',
    freq: '/mois',
    desc: 'Pour les cabinets juridiques, équipes compliance et LegalTech.',
    features: [
      'Analyses illimit\u00e9es pour l\u2019\u00e9quipe',
      'GPT-4o prioritaire',
      'Gestion multi-utilisateurs',
      'Journal d\u2019audit (EU AI Act Art.\u00a012)',
      'SLA garanti & support d\u00e9di\u00e9',
    ],
    highlight: false,
    badge: 'Entreprise',
  },
];

const Upgrade: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async (plan: 'standard' | 'premium' | 'enterprise') => {
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
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="up-main">
        {/* Header */}
        <div className="up-header">
          <span className="up-eyebrow">Tarifs</span>
          <h1 className="up-title">Choisissez votre plan</h1>
          <p className="up-subtitle">
            Des tarifs pensés pour les particuliers, les professionnels et les équipes juridiques.
          </p>
        </div>

        {error && (
          <div className="up-error">{error}</div>
        )}

        {/* Plans grid — matches landing page layout */}
        <div className="up-grid">
          {PLANS.map((plan) => (
            <div
              key={plan.key}
              className={`up-card${plan.highlight ? ' up-card--highlight' : ''}${plan.key === 'enterprise' ? ' up-card--enterprise' : ''}`}
            >
              {plan.badge && (
                <span className="up-badge">{plan.badge}</span>
              )}

              <h2 className="up-plan-name">{plan.name}</h2>
              <div className="up-price">
                <span className="up-amount">{plan.price}</span>
                <span className="up-freq">{plan.freq}</span>
              </div>
              <p className="up-plan-desc">{plan.desc}</p>

              <ul className="up-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <CheckIcon />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                className={`up-btn${plan.highlight ? ' up-btn--primary' : ' up-btn--outline'}`}
                disabled={loading}
                onClick={() => handleUpgrade(plan.key)}
              >
                {loading ? 'Redirection...' : plan.key === 'enterprise' ? "Contacter l'équipe" : `Passer à ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p className="up-note">
          Tous les plans incluent le chiffrement des données, la conformité RGPD et la déclaration EU AI Act Art.&nbsp;13.
        </p>
      </main>
    </div>
  );
};

export default Upgrade;
