// src/screens/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Smiley, ChartPie, Target, Calendar, TrendUp, Rocket, FileText, CheckCircle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { fetchDashboardData, InfoData } from '@/services/InfoService';
import { Link, useNavigate } from 'react-router-dom';
import EmailVerificationBanner from '@/components/common/EmailVerificationBanner';
import UpgradePrompt from '@/components/common/UpgradePrompt';
import { ONBOARDING_KEY } from '@/screens/Onboarding/Onboarding';
import './Dashboard.css';
import '@/styles/Layout.css';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const [dashboardData, setDashboardData] = useState<InfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const firstName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || t('dashboard.default_user');

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken(true);
        const data = await fetchDashboardData(token);
        setDashboardData(data);
        // Redirect to onboarding on first-ever login
        const onboardingDone = localStorage.getItem(`${ONBOARDING_KEY}_${user.uid}`);
        if (!onboardingDone && data.quota.used === 0) {
          navigate('/onboarding');
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  return (
    <div className="dashboard-layout">
      <EmailVerificationBanner />
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <Smiley size={42} weight="duotone" className="hero-icon" />
          <h1 className="hero-title">
            Bonjour <span className="highlight">{firstName} 👋</span>
          </h1>
          <p className="hero-subtitle">
            Bienvenue sur votre tableau de bord TransparAI ! Analysez vos CGA en toute simplicité.
          </p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement de vos données...</p>
          </div>
        ) : (
          <div className="dashboard-content">
            {/* Quick Stats */}
            <div className="stats-grid">
              <div className="stat-card quota-card">
                <div className="stat-icon">
                  <Target size={24} weight="duotone" />
                </div>
                <div className="stat-content">
                  <h3>Quota mensuel</h3>
                  <div className="quota-display">
                    <span className="quota-used">{dashboardData?.quota.used || 0}</span>
                    <span className="quota-separator">/</span>
                    <span className="quota-limit">
                      {dashboardData?.quota.limit === -1 ? '∞' : dashboardData?.quota.limit || 20}
                    </span>
                  </div>
                  <div className="quota-bar">
                    <div 
                      className="quota-progress" 
                      style={{
                        width: dashboardData?.quota.limit === -1 ? '5%' : 
                              `${Math.min(((dashboardData?.quota.used || 0) / (dashboardData?.quota.limit || 20)) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                  <p className="stat-description">
                    {dashboardData?.quota.limit === -1 ? 'Analyses illimitées' : 
                     dashboardData?.quota.remaining === 0 ? 
                     '❌ Quota épuisé - Passez à un plan supérieur' :
                     `${dashboardData?.quota.remaining || 0} analyses restantes ce mois-ci`}
                  </p>
                </div>
              </div>

              <div className="stat-card plan-card">
                <div className="stat-icon">
                  <ChartPie size={24} weight="duotone" />
                </div>
                <div className="stat-content">
                  <h3>Plan actuel</h3>
                  <div className="plan-name">
                    {(dashboardData?.plan === 'free' || dashboardData?.plan === 'starter') && '🆓 Gratuit'}
                    {dashboardData?.plan === 'standard' && '⭐ Standard'}
                    {dashboardData?.plan === 'premium' && '👑 Premium'}
                    {dashboardData?.plan === 'enterprise' && '🏢 Enterprise'}
                  </div>
                  <p className="stat-description">
                    {(dashboardData?.plan === 'free' || dashboardData?.plan === 'starter') && 'Parfait pour débuter !'}
                    {dashboardData?.plan === 'standard' && 'Analyses professionnelles'}
                    {dashboardData?.plan === 'premium' && 'Accès complet illimité'}
                    {dashboardData?.plan === 'enterprise' && 'Gestion multi-utilisateurs + Fonctionnalités avancées'}
                  </p>
                </div>
              </div>

              <div className="stat-card member-card">
                <div className="stat-icon">
                  <Calendar size={24} weight="duotone" />
                </div>
                <div className="stat-content">
                  <h3>Membre depuis</h3>
                  <div className="member-since">
                    {user?.metadata?.creationTime ? 
                      new Date(user.metadata.creationTime).toLocaleDateString('fr-FR', { 
                        month: 'long', 
                        year: 'numeric' 
                      }) : 'Récemment'
                    }
                  </div>
                  <p className="stat-description">Merci de faire confiance à TransparAI</p>
                </div>
              </div>

              <div className="stat-card growth-card">
                <div className="stat-icon">
                  <TrendUp size={24} weight="duotone" />
                </div>
                <div className="stat-content">
                  <h3>Progression</h3>
                  <div className="growth-display">
                    {dashboardData?.quota.used || 0} analyses
                  </div>
                  <p className="stat-description">
                    {(dashboardData?.quota.used || 0) === 0 ? 
                      'Commencez votre première analyse !' : 
                      'Continuez à analyser vos documents'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Upgrade Prompts */}
            {dashboardData?.quota.remaining === 0 && (dashboardData?.plan === 'free' || dashboardData?.plan === 'starter') ? (
              <UpgradePrompt context="quota_reached" />
            ) : (dashboardData?.plan === 'free' || dashboardData?.plan === 'starter') && (
              <UpgradePrompt 
                context={(dashboardData?.quota.used || 0) >= 15 ? 'quota_reached' : 'enhanced_features'}
              />
            )}

            {/* Enhanced Getting Started for New Users */}
            {(dashboardData?.quota.used || 0) === 0 && (
              <div className="getting-started">
                <div className="getting-started-header">
                  <Rocket size={32} weight="duotone" className="rocket-icon" />
                  <h2>Analysez votre premier contrat maintenant !</h2>
                  <p>TransparAI analyse n'importe quel document juridique en 30 secondes. Testez avec l'un de nos exemples ou votre propre contrat.</p>
                </div>
                
                <div className="quick-start-options">
                  <Link to="/analyze?sample=true" className="quick-start-card primary">
                    <div className="card-icon">
                      <FileText size={28} weight="duotone" />
                    </div>
                    <h3>Commencer avec un exemple</h3>
                    <p>Testez TransparAI avec un contrat d'exemple pré-rempli</p>
                    <div className="card-cta">Essayer maintenant →</div>
                  </Link>
                  
                  <Link to="/analyze" className="quick-start-card secondary">
                    <div className="card-icon">
                      <Target size={28} weight="duotone" />
                    </div>
                    <h3>Analyser mon contrat</h3>
                    <p>Uploadez votre propre document ou copiez-collez le texte</p>
                    <div className="card-cta">Commencer →</div>
                  </Link>
                </div>
                
                <div className="demo-preview">
                  <h3>Ce que vous obtiendrez :</h3>
                  <div className="demo-features">
                    <div className="demo-feature">
                      <CheckCircle size={20} weight="fill" color="#10b981" />
                      <span>Score de transparence (Excellent, Bon, Moyen...)</span>
                    </div>
                    <div className="demo-feature">
                      <CheckCircle size={20} weight="fill" color="#10b981" />
                      <span>Résumé en français simple</span>
                    </div>
                    <div className="demo-feature">
                      <CheckCircle size={20} weight="fill" color="#10b981" />
                      <span>Clauses importantes identifiées</span>
                    </div>
                    <div className="demo-feature">
                      <CheckCircle size={20} weight="fill" color="#10b981" />
                      <span>Alertes sur les risques potentiels</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Success Message for Users Who Have Analyzed */}
            {(dashboardData?.quota.used || 0) > 0 && (
              <div className="dashboard-success">
                <div className="success-content">
                  <CheckCircle size={32} weight="duotone" color="#10b981" />
                  <h2>Félicitations ! Vous avez utilisé TransparAI</h2>
                  <p>Vous avez déjà analysé {dashboardData?.quota.used} document{(dashboardData?.quota.used || 0) > 1 ? 's' : ''}. Continuez à analyser vos contrats pour une meilleure protection juridique.</p>
                  <div className="success-actions">
                    <Link to="/analyze" className="btn btn-primary">Nouvelle analyse</Link>
                    {dashboardData?.plan !== 'starter' && <Link to="/history" className="btn btn-outline">Voir l'historique</Link>}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

