// src/screens/Organization/UserManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getMyOrganization, Organization } from '@/services/organizationService';
import {
  inviteUser,
  changeUserRole,
  removeUser,
  getPendingInvitations,
  cancelInvitation,
  getAuditLogs,
  Invitation,
  AuditLog
} from '@/services/userManagementService';
import Sidebar from '@/components/Layout/Sidebar';
import './UserManagement.css';

const UserManagement: React.FC = () => {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'invitations' | 'audit'>('users');
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', role: 'analyst' as const });
  const [inviteLoading, setInviteLoading] = useState(false);

  const canManageUsers = organization?.userRole === 'admin' || organization?.userRole === 'manager';
  const canInviteUsers = canManageUsers;
  const canViewAudit = organization?.userRole === 'admin' || organization?.userRole === 'manager';

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        const token = await user.getIdToken(true);
        const orgData = await getMyOrganization(token);
        setOrganization(orgData);

        // Load invitations if user can manage users
        if (orgData.userRole === 'admin' || orgData.userRole === 'manager') {
          const invitationsData = await getPendingInvitations(token, orgData._id);
          setInvitations(invitationsData.invitations);

          // Load audit logs
          const auditData = await getAuditLogs(token, orgData._id, 1, 20);
          setAuditLogs(auditData.logs);
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleInviteUser = async () => {
    if (!user || !organization) return;

    setInviteLoading(true);
    try {
      const token = await user.getIdToken(true);
      await inviteUser(token, organization._id, inviteForm.email, inviteForm.role);
      
      // Reload invitations
      const invitationsData = await getPendingInvitations(token, organization._id);
      setInvitations(invitationsData.invitations);
      
      setShowInviteModal(false);
      setInviteForm({ email: '', role: 'analyst' });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!user || !organization) return;

    try {
      const token = await user.getIdToken(true);
      await changeUserRole(token, organization._id, userId, newRole as any);
      
      // Reload organization data
      const orgData = await getMyOrganization(token);
      setOrganization(orgData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du changement de rôle');
    }
  };

  const handleRemoveUser = async (userId: string) => {
    if (!user || !organization) return;
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;

    try {
      const token = await user.getIdToken(true);
      await removeUser(token, organization._id, userId);
      
      // Reload organization data
      const orgData = await getMyOrganization(token);
      setOrganization(orgData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    if (!user || !organization) return;

    try {
      const token = await user.getIdToken(true);
      await cancelInvitation(token, organization._id, invitationId);
      
      // Reload invitations
      const invitationsData = await getPendingInvitations(token, organization._id);
      setInvitations(invitationsData.invitations);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'annulation');
    }
  };

  const getRoleColor = (role: string) => {
    const colors = {
      admin: '#dc2626',
      manager: '#ea580c',
      analyst: '#2563eb',
      viewer: '#16a34a'
    };
    return colors[role as keyof typeof colors] || '#6b7280';
  };

  const formatActionName = (action: string) => {
    const names = {
      user_invited: 'Utilisateur invité',
      user_joined: 'Utilisateur rejoint',
      user_role_changed: 'Rôle modifié',
      user_removed: 'Utilisateur supprimé',
      analysis_created: 'Analyse créée',
      analysis_exported: 'Analyse exportée',
      organization_settings_updated: 'Paramètres mis à jour'
    };
    return names[action as keyof typeof names] || action;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="user-mgmt-main">
          <div className="loading">Chargement...</div>
        </main>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="dashboard-layout">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="user-mgmt-main">
          <div className="error">Aucune organisation trouvée</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="user-mgmt-main">
        <div className="user-mgmt-header">
          <h1 className="user-mgmt-title">👥 Gestion des utilisateurs</h1>
          <p className="user-mgmt-subtitle">Gérez les membres de votre équipe, leurs rôles et permissions.</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="user-mgmt-tabs">
          <button 
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Utilisateurs ({organization.users?.length || 0})
          </button>
          {canManageUsers && (
            <button 
              className={activeTab === 'invitations' ? 'active' : ''}
              onClick={() => setActiveTab('invitations')}
            >
              Invitations ({invitations.length})
            </button>
          )}
          {canViewAudit && (
            <button 
              className={activeTab === 'audit' ? 'active' : ''}
              onClick={() => setActiveTab('audit')}
            >
              Journal d'activité
            </button>
          )}
        </div>

        <div className="user-mgmt-content">
          {activeTab === 'users' && (
            <div className="users-section">
              <div className="section-header">
                <h3>Membres de l'équipe</h3>
                {canInviteUsers && (
                  <button className="btn btn-primary" onClick={() => setShowInviteModal(true)}>
                    + Inviter un utilisateur
                  </button>
                )}
              </div>

              <div className="users-grid">
                {organization.users?.map(user => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <div className="user-name">{user.name || user.email}</div>
                      <div className="user-email">{user.email}</div>
                      <div className="user-stats">
                        <span>{user.analysesCount} analyses</span>
                        <span>Depuis {new Date(user.joinedAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="user-actions">
                      <span 
                        className="role-badge" 
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      >
                        {user.role}
                      </span>
                      {canManageUsers && user.id !== user.id && (
                        <div className="user-controls">
                          <select 
                            value={user.role}
                            onChange={(e) => handleChangeRole(user.id, e.target.value)}
                            className="role-select"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="analyst">Analyst</option>
                            <option value="manager">Manager</option>
                            {organization.userRole === 'admin' && (
                              <option value="admin">Admin</option>
                            )}
                          </select>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={() => handleRemoveUser(user.id)}
                          >
                            Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'invitations' && canManageUsers && (
            <div className="invitations-section">
              <h3>Invitations en attente</h3>
              {invitations.length === 0 ? (
                <div className="empty-state">Aucune invitation en attente</div>
              ) : (
                <div className="invitations-list">
                  {invitations.map(invitation => (
                    <div key={invitation.id} className="invitation-card">
                      <div className="invitation-info">
                        <div className="invitation-email">{invitation.email}</div>
                        <div className="invitation-details">
                          <span>Rôle: {invitation.role}</span>
                          <span>Invité par: {invitation.invitedBy.email}</span>
                          <span>Expire: {new Date(invitation.expiresAt).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelInvitation(invitation.id)}
                      >
                        Annuler
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'audit' && canViewAudit && (
            <div className="audit-section">
              <h3>Journal d'activité</h3>
              <div className="audit-logs">
                {auditLogs.map(log => (
                  <div key={log._id} className="audit-log">
                    <div className="log-info">
                      <div className="log-action">{formatActionName(log.action)}</div>
                      <div className="log-details">
                        <span>{log.userId.email}</span>
                        <span>{new Date(log.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className="log-metadata">
                      {log.metadata.targetUserId && (
                        <span>Cible: {log.metadata.targetUserId.email}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Inviter un utilisateur</h3>
                <button className="modal-close" onClick={() => setShowInviteModal(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Adresse email</label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                    placeholder="utilisateur@exemple.com"
                  />
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm({...inviteForm, role: e.target.value as any})}
                  >
                    <option value="viewer">Viewer - Lecture seule</option>
                    <option value="analyst">Analyst - Créer et modifier des analyses</option>
                    <option value="manager">Manager - Gérer les utilisateurs</option>
                    {organization.userRole === 'admin' && (
                      <option value="admin">Admin - Accès complet</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setShowInviteModal(false)}>
                  Annuler
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleInviteUser}
                  disabled={inviteLoading || !inviteForm.email}
                >
                  {inviteLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserManagement;