// src/screens/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { FileText, Target, CheckCircle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { fetchDashboardData, InfoData } from '@/services/InfoService';
import { Link, useNavigate } from 'react-router-dom';
import EmailVerificationBanner from '@/components/common/EmailVerificationBanner';
import { ONBOARDING_KEY } from '@/screens/Onboarding/Onboarding';
import './Dashboard.css';
import '@/styles/Layout.css';

const PLAN_LABELS: Record<string, string> = {
  free: 'Gratuit',
  starter: 'Gratuit',
  standard: 'Standard',
  premium: 'Premium',
  enterprise: 'Enterprise',
};

const PLAN_DESC: Record<string, string> = {
  free: '5 analyses / mois',
  starter: '5 analyses / mois',
  standard: '100 analyses / mois',
  premium: 'Analyses illimitées',
  enterprise: 'Multi-utilisateurs',
};

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  useTranslation();
  const [dashboardData, setDashboardData] = useState<InfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'vous';

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken(true);
        const data = await fetchDashboardData(token);
        setDashboardData(data);
        const onboardingDone = localStorage.getItem(`${ONBOARDING_KEY}_${user.uid}`);
        if (!onboardingDone && data.quota.used === 0) {
          navigate('/onboarding');
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const quota = dashboardData?.quota;
  const plan = dashboardData?.plan ?? 'free';
  const isFreePlan = plan === 'free' || plan === 'starter';
  const analysesUsed = quota?.used ?? 0;
  const quotaLimit = quota?.limit ?? 5;
  const quotaRemaining = quota?.remaining ?? 5;
  const quotaProgress = quotaLimit === -1 ? 5 : Math.min((analysesUsed / quotaLimit) * 100, 100);
  const quotaDanger = quotaRemaining === 0;

  return (
    <div className="dashboard-layout">
      <EmailVerificationBanner />
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dashboard-main">
        {/* Page header */}
        <div className="db-header">
          <p className="db-header-eyebrow">Tableau de bord</p>
          <h1 className="db-header-title">Bonjour, {firstName}</h1>
          <p className="db-header-sub">
            Bienvenue sur TransparAI — analysez vos contrats en 30 secondes.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner" />
            <span>Chargement...</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="stats-grid">
              {/* Quota */}
              <div className="stat-card quota-card">
                <h3>Quota mensuel</h3>
                <div className="quota-display">
                  <span className="quota-used">{analysesUsed}</span>
                  <span className="quota-separator">/</span>
                  <span className="quota-limit">
                    {quotaLimit === -1 ? '\u221e' : quotaLimit}
                  </span>
                </div>
                <div className="quota-bar">
                  <div
                    className={`quota-progress${quotaDanger ? ' danger' : ''}`}
                    style={{ width: `${quotaProgress}%` }}
                  />
                </div>
                <p className="stat-description">
                  {quotaLimit === -1
                    ? 'Analyses illimitées'
                    : quotaDanger
                    ? 'Quota épuisé'
                    : `${quotaRemaining} restante${quotaRemaining > 1 ? 's' : ''} ce mois`}
                </p>
              </div>

              {/* Plan */}
              <div className="stat-card plan-card">
                <h3>Plan actuel</h3>
                <div className="plan-name">{PLAN_LABELS[plan] ?? plan}</div>
                <p className="stat-description">{PLAN_DESC[plan] ?? ''}</p>
              </div>

              {/* Membre depuis */}
              <div className="stat-card member-card">
                <h3>Membre depuis</h3>
                <div className="member-since">
                  {user?.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', {
                        month: 'long',
                        year: 'numeric',
                      })
                    : 'Récemment'}
                </div>
                <p className="stat-description">Merci de faire confiance à TransparAI</p>
              </div>

              {/* Analyses */}
              <div className="stat-card growth-card">
                <h3>Analyses effectuées</h3>
                <div className="growth-display">{analysesUsed}</div>
                <p className="stat-description">
                  {analysesUsed === 0
                    ? 'Commencez votre première analyse'
                    : `document${analysesUsed > 1 ? 's' : ''} analysé${analysesUsed > 1 ? 's' : ''}`}
                </p>
              </div>
            </div>

            {/* Upgrade nudge */}
            {isFreePlan && quotaDanger && (
              <div className="db-upgrade">
                <div className="db-upgrade-text">
                  <strong>Quota mensuel épuisé</strong>
                  <span>Passez à Standard pour 100 analyses/mois, l'export PDF et l'historique.</span>
                </div>
                <Link to="/upgrade" className="db-upgrade-btn">Mettre à niveau</Link>
              </div>
            )}

            {isFreePlan && !quotaDanger && analysesUsed >= 3 && (
              <div className="db-upgrade">
                <div className="db-upgrade-text">
                  <strong>Profitez de plus d'analyses</strong>
                  <span>Il vous reste {quotaRemaining} analyse{quotaRemaining > 1 ? 's' : ''}. Standard vous offre 100 analyses/mois.</span>
                </div>
                <Link to="/upgrade" className="db-upgrade-btn">Découvrir Standard</Link>
              </div>
            )}

            {/* Getting started for new users */}
            {analysesUsed === 0 && (
              <div className="getting-started">
                <div className="getting-started-header">
                  <p className="getting-started-eyebrow">Première étape</p>
                  <h2>Analysez votre premier contrat</h2>
                  <p>
                    TransparAI analyse n'importe quel document juridique en 30 secondes.
                    Testez avec un exemple ou votre propre contrat.
                  </p>
                </div>

                <div className="quick-start-options">
                  <Link to="/analyze?sample=true" className="quick-start-card primary">
                    <div className="card-icon">
                      <FileText size={18} />
                    </div>
                    <h3>Commencer avec un exemple</h3>
                    <p>Testez TransparAI avec un contrat d'exemple pré-rempli.</p>
                    <div className="card-cta">Essayer &rarr;</div>
                  </Link>

                  <Link to="/analyze" className="quick-start-card secondary">
                    <div className="card-icon">
                      <Target size={18} />
                    </div>
                    <h3>Analyser mon contrat</h3>
                    <p>Uploadez votre propre document ou copiez-collez le texte.</p>
                    <div className="card-cta">Commencer &rarr;</div>
                  </Link>
                </div>

                <div className="demo-preview">
                  <h3>Résultats obtenus à chaque analyse</h3>
                  <div className="demo-features">
                    {[
                      'Score de transparence (A à F)',
                      'Résumé en français clair',
                      'Clauses à risque identifiées',
                      'Alertes sur engagements cachés',
                    ].map((item) => (
                      <div className="demo-feature" key={item}>
                        <span className="demo-check" aria-hidden />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Success section for returning users */}
            {analysesUsed > 0 && (
              <div className="dashboard-success">
                <div className="success-icon-wrap">
                  <CheckCircle size={22} weight="fill" />
                </div>
                <div className="success-body">
                  <h2>
                    {analysesUsed} document{analysesUsed > 1 ? 's' : ''} analysé{analysesUsed > 1 ? 's' : ''}
                  </h2>
                  <p>
                    Continuez à analyser vos contrats pour une meilleure protection juridique.
                    Chaque analyse vous fait économiser du temps et réduit vos risques.
                  </p>
                  <div className="success-actions">
                    <Link to="/analyze" className="btn btn-primary">Nouvelle analyse</Link>
                    <Link to="/account" className="btn btn-outline">Mon compte</Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
