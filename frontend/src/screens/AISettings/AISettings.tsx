// src/screens/AISettings/AISettings.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import {
  getAISettings,
  updateAISettings,
  AISettings as AISettingsType,
  AIUsageStats,
  MODEL_INFO,
  PLAN_FEATURES
} from '../../services/aiSettingsService';
import '@/styles/Layout.css';
import './AISettings.css';

const AISettings: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [aiSettings, setAiSettings] = useState<AISettingsType | null>(null);
  const [usageStats, setUsageStats] = useState<AIUsageStats | null>(null);
  const [userPlan, setUserPlan] = useState<string>('free');
  const [planBudget, setPlanBudget] = useState<number>(0);

  useEffect(() => {
    fetchAISettings();

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        setLoading(false);
        setError('Timeout lors du chargement des paramètres IA');
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [currentUser]);

  const fetchAISettings = async () => {
    if (!currentUser) {
      return;
    }

    try {
      setLoading(true);
      const token = await currentUser.getIdToken();
      const response = await getAISettings(token);

      setAiSettings(response.data.aiSettings);
      setUsageStats(response.data.aiUsageStats);
      setUserPlan(response.data.plan);
      setPlanBudget(response.data.planBudget);
    } catch (err) {
      setError('Erreur lors du chargement des paramètres IA');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (newSettings: Partial<Pick<AISettingsType, 'preferredModel' | 'allowPremiumAI'>>) => {
    if (!currentUser || !aiSettings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = await currentUser.getIdToken();
      await updateAISettings(token, newSettings);

      // Update local state
      setAiSettings({ ...aiSettings, ...newSettings });
      setSuccess('Paramètres mis à jour avec succès');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getBudgetPercentage = () => {
    if (!aiSettings?.monthlyAIBudget.allocated) return 0;
    return (aiSettings.monthlyAIBudget.used / aiSettings.monthlyAIBudget.allocated) * 100;
  };

  const getAvailableModels = () => {
    return PLAN_FEATURES[userPlan as keyof typeof PLAN_FEATURES]?.availableModels || ['gpt-4o-mini'];
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle ai-hamburger" onClick={() => setIsSidebarOpen(true)}>
        <span className="ai-hamburger-bar" />
        <span className="ai-hamburger-bar" />
        <span className="ai-hamburger-bar" />
      </button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dashboard-main ai-main">
        <div className="ai-page-header">
          <h1 className="ai-page-title">Paramètres IA</h1>
          <p className="ai-page-subtitle">Configurez vos préférences pour l'analyse de documents par intelligence artificielle</p>
          <div className="ai-header-rule" />
        </div>

        {error && (
          <div className="ai-alert ai-alert--error">{error}</div>
        )}
        {success && (
          <div className="ai-alert ai-alert--success">{success}</div>
        )}

        {loading ? (
          <div className="ai-loading">
            <div className="ai-spinner" />
            <p>Chargement des paramètres IA…</p>
          </div>
        ) : !aiSettings || !usageStats ? (
          <div className="ai-error-state">
            <h3>Erreur</h3>
            <p>{error || 'Impossible de charger les paramètres IA'}</p>
            <button onClick={fetchAISettings} className="ai-retry-btn">Réessayer</button>
          </div>
        ) : (
          <div className="ai-content">

            {/* Budget */}
            <section className="ai-section">
              <div className="ai-section-head">
                <span className="ai-section-label">Budget IA Mensuel</span>
                <div className="ai-section-rule" />
              </div>
              <div className="ai-budget-grid">
                <div className="ai-budget-cell">
                  <span className="ai-budget-cell-label">Alloué</span>
                  <span className="ai-budget-cell-value">${aiSettings.monthlyAIBudget.allocated.toFixed(2)}</span>
                </div>
                <div className="ai-budget-cell">
                  <span className="ai-budget-cell-label">Utilisé</span>
                  <span className="ai-budget-cell-value">${aiSettings.monthlyAIBudget.used.toFixed(2)}</span>
                </div>
                <div className="ai-budget-cell">
                  <span className="ai-budget-cell-label">Restant</span>
                  <span className="ai-budget-cell-value">${aiSettings.monthlyAIBudget.remaining.toFixed(2)}</span>
                </div>
              </div>
              <div className="ai-budget-bar-wrap">
                <div className="ai-budget-bar">
                  <div
                    className={`ai-budget-fill ${getBudgetPercentage() > 80 ? 'ai-budget-fill--warn' : ''}`}
                    style={{ width: `${Math.min(getBudgetPercentage(), 100)}%` }}
                  />
                </div>
                <span className="ai-budget-status">
                  {getBudgetPercentage() < 80 ? 'Budget disponible' :
                   getBudgetPercentage() < 100 ? 'Budget presque épuisé' : 'Budget épuisé'}
                </span>
              </div>

              {userPlan === 'free' && (
                <div className="ai-upgrade-notice">
                  <p><strong>Passez à un plan payant</strong> pour débloquer l'IA premium et augmenter votre budget mensuel.</p>
                  <a href="/upgrade" className="ai-upgrade-link">Voir les plans</a>
                </div>
              )}
            </section>

            {/* Model Selection */}
            <section className="ai-section">
              <div className="ai-section-head">
                <span className="ai-section-label">Modèle IA Préféré</span>
                <div className="ai-section-rule" />
              </div>
              <p className="ai-section-desc">Choisissez le modèle IA utilisé pour l'analyse de vos documents</p>
              <div className="ai-model-grid">
                {Object.entries(MODEL_INFO).map(([modelKey, info]) => {
                  const isAvailable = getAvailableModels().includes(modelKey as any);
                  const isSelected = aiSettings.preferredModel === modelKey;
                  return (
                    <div
                      key={modelKey}
                      className={`ai-model-card ${isSelected ? 'ai-model-card--selected' : ''} ${!isAvailable ? 'ai-model-card--disabled' : ''}`}
                      onClick={() => isAvailable && handleSaveSettings({ preferredModel: modelKey as any })}
                    >
                      {isSelected && <div className="ai-model-card-head">Sélectionné</div>}
                      {!isAvailable && <div className="ai-model-card-head ai-model-card-head--locked">Plan supérieur requis</div>}
                      <h3 className="ai-model-name">{info.name}</h3>
                      <p className="ai-model-desc">{info.description}</p>
                      <span className="ai-model-cost">{info.cost}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Usage Stats */}
            <section className="ai-section">
              <div className="ai-section-head">
                <span className="ai-section-label">Statistiques d'Usage</span>
                <div className="ai-section-rule" />
              </div>
              <div className="ai-stats-grid">
                <div className="ai-stat-cell">
                  <span className="ai-stat-num">{usageStats.totalAnalyses}</span>
                  <span className="ai-stat-label">Analyses totales</span>
                </div>
                <div className="ai-stat-cell">
                  <span className="ai-stat-num">{usageStats.gpt4oAnalyses}</span>
                  <span className="ai-stat-label">Analyses GPT-4o</span>
                </div>
                <div className="ai-stat-cell">
                  <span className="ai-stat-num">{usageStats.gpt4oMiniAnalyses}</span>
                  <span className="ai-stat-label">Analyses GPT-4o Mini</span>
                </div>
                <div className="ai-stat-cell">
                  <span className="ai-stat-num">${usageStats.totalAICost.toFixed(2)}</span>
                  <span className="ai-stat-label">Coût total IA</span>
                </div>
              </div>
            </section>

            {/* Advanced Settings */}
            <section className="ai-section">
              <div className="ai-section-head">
                <span className="ai-section-label">Paramètres Avancés</span>
                <div className="ai-section-rule" />
              </div>
              <div className="ai-setting-row">
                <div className="ai-setting-info">
                  <h3 className="ai-setting-title">Autoriser l'IA Premium</h3>
                  <p className="ai-setting-desc">Permet l'utilisation automatique des modèles GPT payants selon votre budget</p>
                </div>
                <label className="ai-toggle">
                  <input
                    type="checkbox"
                    checked={aiSettings.allowPremiumAI}
                    onChange={(e) => handleSaveSettings({ allowPremiumAI: e.target.checked })}
                    disabled={saving || userPlan === 'free'}
                  />
                  <span className="ai-toggle-slider" />
                </label>
              </div>
            </section>

            {/* Plan Info */}
            <section className="ai-section">
              <div className="ai-section-head">
                <span className="ai-section-label">Votre Plan — {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</span>
                <div className="ai-section-rule" />
              </div>
              <div className="ai-plan-details">
                <p className="ai-plan-row"><span className="ai-plan-key">Budget mensuel</span><span className="ai-plan-val">${planBudget}/mois</span></p>
                <p className="ai-plan-row"><span className="ai-plan-key">Modèles disponibles</span></p>
                <div className="ai-model-tags">
                  {getAvailableModels().map(model => (
                    <span key={model} className="ai-model-tag">
                      {MODEL_INFO[model as keyof typeof MODEL_INFO].name}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default AISettings;
