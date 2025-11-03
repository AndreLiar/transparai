// src/screens/Organization/OrganizationDashboard.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  getMyOrganization, 
  updateOrganizationSettings, 
  getOrganizationBilling,
  Organization,
  OrganizationBilling 
} from '@/services/organizationService';
import { fetchDashboardData } from '@/services/InfoService';
import Sidebar from '@/components/Layout/Sidebar';
import CreateOrganization from '@/components/Organization/CreateOrganization';
import InviteUsers from '@/components/Organization/InviteUsers';
import './OrganizationDashboard.css';

const OrganizationDashboard: React.FC = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [billing, setBilling] = useState<OrganizationBilling | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'billing' | 'users' | 'invitations' | 'audit'>('overview');
  const [editingSettings, setEditingSettings] = useState(false);
  const [userPlan, setUserPlan] = useState('free');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    domain: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#6b7280',
    companyName: ''
  });

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken(true);
        
        // Load user plan first
        const dashboardData = await fetchDashboardData(token);
        setUserPlan(dashboardData.plan);
        
        // Check if user has enterprise plan
        if (dashboardData.plan !== 'enterprise') {
          setError('Vous devez avoir un plan Enterprise pour accéder aux fonctionnalités d\'organisation.');
          setLoading(false);
          return;
        }
        
        // Try to load organization
        const orgData = await getMyOrganization(token);
        setOrganization(orgData);
        
        // Initialize settings form
        setSettingsForm({
          name: orgData.name,
          domain: orgData.domain || '',
          primaryColor: orgData.settings.branding.primaryColor,
          secondaryColor: orgData.settings.branding.secondaryColor,
          companyName: orgData.settings.branding.companyName
        });

        // Load billing if user has access
        if (['admin', 'manager'].includes(orgData.userRole || '')) {
          const billingData = await getOrganizationBilling(token, orgData._id);
          setBilling(billingData);
        }
      } catch (err: any) {
        if (err.message === 'NO_ORGANIZATION') {
          // User has enterprise plan but no organization
          setError('');
          setOrganization(null);
        } else {
          setError(err.message || 'Erreur lors du chargement de l\'organisation');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleSettingsUpdate = async () => {
    if (!user || !organization) return;

    try {
      const token = await user.getIdToken(true);
      const updates = {
        name: settingsForm.name,
        domain: settingsForm.domain,
        branding: {
          primaryColor: settingsForm.primaryColor,
          secondaryColor: settingsForm.secondaryColor,
          companyName: settingsForm.companyName
        }
      };

      await updateOrganizationSettings(token, organization._id, updates);
      
      // Reload organization data
      const orgData = await getMyOrganization(token);
      setOrganization(orgData);
      setEditingSettings(false);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleOrganizationCreated = async () => {
    setShowCreateForm(false);
    setLoading(true);
    
    try {
      if (!user) return;
      const token = await user.getIdToken(true);
      const orgData = await getMyOrganization(token);
      setOrganization(orgData);
      
      // Initialize settings form
      setSettingsForm({
        name: orgData.name,
        domain: orgData.domain || '',
        primaryColor: orgData.settings.branding.primaryColor,
        secondaryColor: orgData.settings.branding.secondaryColor,
        companyName: orgData.settings.branding.companyName
      });

      // Load billing if user has access
      if (['admin', 'manager'].includes(orgData.userRole || '')) {
        const billingData = await getOrganizationBilling(token, orgData._id);
        setBilling(billingData);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du rechargement de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="org-main">
          <div className="loading">Chargement de l'organisation...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="org-main">
          <div className="error">{error}</div>
        </main>
      </div>
    );
  }

  if (!organization && userPlan === 'enterprise') {
    if (showCreateForm) {
      return (
        <div className="dashboard-layout">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <main className="org-main">
            <CreateOrganization 
              onSuccess={handleOrganizationCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </main>
        </div>
      );
    }

    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="org-main">
          <div className="no-org">
            <div className="no-org-header">
              <h2>🏢 Bienvenue dans TransparAI Enterprise</h2>
              <p>Vous avez accès aux fonctionnalités Enterprise ! Créez votre organisation pour commencer.</p>
            </div>
            
            <div className="no-org-actions">
              <button 
                className="btn btn-primary create-org-btn"
                onClick={() => setShowCreateForm(true)}
              >
                🚀 Créer une organisation
              </button>
              
              <div className="join-org-section">
                <h3>Ou rejoindre une organisation existante</h3>
                <p>Si vous avez reçu une invitation, vérifiez votre email ou contactez votre administrateur.</p>
              </div>
            </div>

            <div className="enterprise-features-preview">
              <h3>✨ Fonctionnalités Enterprise disponibles</h3>
              <div className="features-grid">
                <div className="feature-item">
                  <span className="feature-icon">👥</span>
                  <div>
                    <h4>Gestion multi-utilisateurs</h4>
                    <p>Invitez votre équipe avec des rôles personnalisés</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <div>
                    <h4>Analyse comparative</h4>
                    <p>Comparez jusqu'à 5 documents simultanément</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🎨</span>
                  <div>
                    <h4>Personnalisation de marque</h4>
                    <p>Adaptez l'interface aux couleurs de votre entreprise</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📋</span>
                  <div>
                    <h4>Journal d'audit</h4>
                    <p>Traçabilité complète des actions de l'équipe</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="org-main">
        <div className="org-header">
          <div className="org-info">
            <h1 className="org-title">{organization.name}</h1>
            <span className="org-role">{organization.userRole}</span>
          </div>
          <div className="org-tabs">
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Vue d'ensemble
            </button>
            {['admin', 'manager'].includes(organization.userRole || '') && (
              <button 
                className={activeTab === 'users' ? 'active' : ''}
                onClick={() => setActiveTab('users')}
              >
                Utilisateurs
              </button>
            )}
            {['admin', 'manager'].includes(organization.userRole || '') && (
              <>
                <button 
                  className={activeTab === 'invitations' ? 'active' : ''}
                  onClick={() => setActiveTab('invitations')}
                >
                  Invitations
                </button>
                <button 
                  className={activeTab === 'billing' ? 'active' : ''}
                  onClick={() => setActiveTab('billing')}
                >
                  Facturation
                </button>
                <button 
                  className={activeTab === 'settings' ? 'active' : ''}
                  onClick={() => setActiveTab('settings')}
                >
                  Paramètres
                </button>
              </>
            )}
          </div>
        </div>

        <div className="org-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Utilisateurs</h3>
                  <p className="stat-number">{organization.analytics?.totalUsers || 0}</p>
                  <span className="stat-label">Total actifs</span>
                </div>
                <div className="stat-card">
                  <h3>Analyses totales</h3>
                  <p className="stat-number">{organization.analytics?.totalAnalyses || 0}</p>
                  <span className="stat-label">Toutes périodes</span>
                </div>
                <div className="stat-card">
                  <h3>Ce mois</h3>
                  <p className="stat-number">{organization.analytics?.monthlyAnalyses || 0}</p>
                  <span className="stat-label">Analyses réalisées</span>
                </div>
                <div className="stat-card">
                  <h3>Moyenne</h3>
                  <p className="stat-number">{organization.analytics?.averageAnalysesPerUser || 0}</p>
                  <span className="stat-label">Par utilisateur</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-tab">
              <h3>Équipe ({organization.users?.length || 0} membres)</h3>
              <div className="users-list">
                {organization.users?.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <strong>{user.name || user.email}</strong>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="user-stats">
                      <span className="user-role">{user.role}</span>
                      <span className="user-analyses">{user.analysesCount} analyses</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invitations' && organization && ['admin', 'manager'].includes(organization.userRole || '') && (
            <div className="invitations-tab">
              <InviteUsers 
                organizationId={organization._id}
                onInviteSent={() => {
                  // Optionally reload organization data to show updated member count
                  console.log('Invitations sent successfully');
                }}
              />
            </div>
          )}

          {activeTab === 'billing' && billing && (
            <div className="billing-tab">
              <h3>Facturation</h3>
              <div className="billing-info">
                <div className="billing-card">
                  <h4>Plan actuel</h4>
                  <p><strong>{billing.currentUsers}</strong> utilisateurs actifs</p>
                  <p><strong>{billing.maxUsers}</strong> utilisateurs maximum</p>
                  <p><strong>{billing.pricePerUser}€</strong> par utilisateur/mois</p>
                </div>
                <div className="billing-card">
                  <h4>Coûts</h4>
                  <p>Mensuel: <strong>{billing.costs.monthly}€</strong></p>
                  <p>Annuel: <strong>{billing.costs.yearly}€</strong> (-15%)</p>
                  <p>Prochaine facturation: {new Date(billing.nextBillingDate).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && organization && organization.userRole === 'admin' && (
            <div className="settings-tab">
              <h3>Paramètres de l'organisation</h3>
              <div className="settings-form">
                <div className="form-group">
                  <label>Nom de l'organisation</label>
                  <input
                    type="text"
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({...settingsForm, name: e.target.value})}
                    disabled={!editingSettings}
                  />
                </div>
                <div className="form-group">
                  <label>Domaine</label>
                  <input
                    type="text"
                    value={settingsForm.domain}
                    onChange={(e) => setSettingsForm({...settingsForm, domain: e.target.value})}
                    disabled={!editingSettings}
                    placeholder="exemple.com"
                  />
                </div>
                <div className="form-group">
                  <label>Nom de la société</label>
                  <input
                    type="text"
                    value={settingsForm.companyName}
                    onChange={(e) => setSettingsForm({...settingsForm, companyName: e.target.value})}
                    disabled={!editingSettings}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Couleur primaire</label>
                    <input
                      type="color"
                      value={settingsForm.primaryColor}
                      onChange={(e) => setSettingsForm({...settingsForm, primaryColor: e.target.value})}
                      disabled={!editingSettings}
                    />
                  </div>
                  <div className="form-group">
                    <label>Couleur secondaire</label>
                    <input
                      type="color"
                      value={settingsForm.secondaryColor}
                      onChange={(e) => setSettingsForm({...settingsForm, secondaryColor: e.target.value})}
                      disabled={!editingSettings}
                    />
                  </div>
                </div>
                <div className="form-actions">
                  {!editingSettings ? (
                    <button className="btn btn-primary" onClick={() => setEditingSettings(true)}>
                      Modifier les paramètres
                    </button>
                  ) : (
                    <>
                      <button className="btn btn-primary" onClick={handleSettingsUpdate}>
                        Enregistrer
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditingSettings(false)}>
                        Annuler
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OrganizationDashboard;