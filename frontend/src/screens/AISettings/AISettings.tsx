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
  console.log('🚀 AISettings component rendered');
  const { user: currentUser } = useAuth();
  console.log('👤 Current user:', !!currentUser, currentUser?.email);
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
    console.log('⚡ useEffect triggered, currentUser:', !!currentUser);
    fetchAISettings();
    
    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (loading) {
        console.log('⏰ Timeout reached, stopping loading');
        setLoading(false);
        setError('Timeout lors du chargement des paramètres IA');
      }
    }, 10000); // 10 second timeout
    
    return () => clearTimeout(timeout);
  }, [currentUser]);

  const fetchAISettings = async () => {
    console.log('🔍 fetchAISettings called, currentUser:', !!currentUser);
    if (!currentUser) {
      console.log('❌ No current user, returning');
      return;
    }
    
    try {
      setLoading(true);
      console.log('🔄 Getting ID token...');
      const token = await currentUser.getIdToken();
      console.log('✅ Token obtained, calling API...');
      const response = await getAISettings(token);
      console.log('✅ API response received:', response);
      
      setAiSettings(response.data.aiSettings);
      setUsageStats(response.data.aiUsageStats);
      setUserPlan(response.data.plan);
      setPlanBudget(response.data.planBudget);
    } catch (error) {
      console.error('❌ Error fetching AI settings:', error);
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
    } catch (error) {
      setError('Erreur lors de la sauvegarde');
      console.error('Error updating AI settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const getBudgetPercentage = () => {
    if (!aiSettings?.monthlyAIBudget.allocated) return 0;
    return (aiSettings.monthlyAIBudget.used / aiSettings.monthlyAIBudget.allocated) * 100;
  };

  const getAvailableModels = () => {
    return PLAN_FEATURES[userPlan as keyof typeof PLAN_FEATURES]?.availableModels || ['gemini'];
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dashboard-main">
        <div className="ai-settings-heading">
          <h1>🤖 Paramètres IA</h1>
          <p>Configurez vos préférences pour l'analyse de documents par intelligence artificielle</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>❌</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>✅</span>
            <span>{success}</span>
          </div>
        )}

        {loading ? (
          <div className="ai-settings-loading">
            <div className="spinner"></div>
            <p>Chargement des paramètres IA...</p>
          </div>
        ) : !aiSettings || !usageStats ? (
          <div className="ai-settings-error">
            <h3>Erreur</h3>
            <p>{error || 'Impossible de charger les paramètres IA'}</p>
            <button onClick={fetchAISettings} className="retry-btn">
              Réessayer
            </button>
          </div>
        ) : (
          <div className="ai-settings-content">
            {/* Budget Overview */}
            <div className="ai-card">
              <h2>💰 Budget IA Mensuel</h2>
              <div className="budget-overview">
                <div className="budget-stats">
                  <div className="budget-stat">
                    <span className="label">Alloué:</span>
                    <span className="value">${aiSettings.monthlyAIBudget.allocated.toFixed(2)}</span>
                  </div>
                  <div className="budget-stat">
                    <span className="label">Utilisé:</span>
                    <span className="value">${aiSettings.monthlyAIBudget.used.toFixed(2)}</span>
                  </div>
                  <div className="budget-stat">
                    <span className="label">Restant:</span>
                    <span className="value">${aiSettings.monthlyAIBudget.remaining.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="budget-bar">
                  <div 
                    className="budget-progress" 
                    style={{ width: `${Math.min(getBudgetPercentage(), 100)}%` }}
                  ></div>
                </div>
                
                <p className="budget-text">
                  {getBudgetPercentage() < 80 ? '✅ Budget disponible' : 
                   getBudgetPercentage() < 100 ? '⚠️ Budget presque épuisé' : '❌ Budget épuisé'}
                </p>
              </div>

              {userPlan === 'free' && (
                <div className="upgrade-prompt">
                  <p>🚀 <strong>Passez à un plan payant</strong> pour débloquer l'IA premium!</p>
                  <button className="upgrade-btn">Voir les plans</button>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="ai-card">
              <h2>🎯 Modèle IA Préféré</h2>
              <p>Choisissez le modèle IA utilisé pour l'analyse de vos documents</p>
              
              <div className="model-grid">
                {Object.entries(MODEL_INFO).map(([modelKey, info]) => {
                  const isAvailable = getAvailableModels().includes(modelKey as any);
                  const isSelected = aiSettings.preferredModel === modelKey;
                  
                  return (
                    <div 
                      key={modelKey}
                      className={`model-card ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled' : ''}`}
                      onClick={() => isAvailable && handleSaveSettings({ preferredModel: modelKey as any })}
                    >
                      <div className="model-icon">{info.icon}</div>
                      <h3>{info.name}</h3>
                      <p>{info.description}</p>
                      <div className="model-cost">{info.cost}</div>
                      
                      {!isAvailable && (
                        <div className="upgrade-badge">
                          Requiert plan supérieur
                        </div>
                      )}
                      
                      {isSelected && <div className="selected-badge">✓ Sélectionné</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="ai-card">
              <h2>📊 Statistiques d'Usage</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-number">{usageStats.totalAnalyses}</span>
                  <span className="stat-label">Analyses totales</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{usageStats.gptAnalyses}</span>
                  <span className="stat-label">Analyses GPT</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">{usageStats.geminiAnalyses}</span>
                  <span className="stat-label">Analyses Gemini</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">${usageStats.totalAICost.toFixed(2)}</span>
                  <span className="stat-label">Coût total IA</span>
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="ai-card">
              <h2>⚙️ Paramètres Avancés</h2>
              
              <div className="setting-item">
                <div className="setting-info">
                  <h3>Autoriser l'IA Premium</h3>
                  <p>Permet l'utilisation automatique des modèles GPT payants selon votre budget</p>
                </div>
                <label className="toggle-switch">
                  <input 
                    type="checkbox" 
                    checked={aiSettings.allowPremiumAI}
                    onChange={(e) => handleSaveSettings({ allowPremiumAI: e.target.checked })}
                    disabled={saving || userPlan === 'free'}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            {/* Plan Information */}
            <div className="ai-card">
              <h2>📋 Votre Plan: {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}</h2>
              <div className="plan-info">
                <p><strong>Budget mensuel:</strong> ${planBudget}/mois</p>
                <p><strong>Modèles disponibles:</strong></p>
                <div className="available-models">
                  {getAvailableModels().map(model => (
                    <span key={model} className="model-tag">
                      {MODEL_INFO[model as keyof typeof MODEL_INFO].icon} {MODEL_INFO[model as keyof typeof MODEL_INFO].name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AISettings;