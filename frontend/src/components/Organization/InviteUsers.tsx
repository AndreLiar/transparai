// src/components/Organization/InviteUsers.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import './InviteUsers.css';

interface InviteUsersProps {
  organizationId: string;
  onInviteSent: () => void;
}

interface InviteForm {
  email: string;
  role: 'admin' | 'manager' | 'member';
  message: string;
}

const InviteUsers: React.FC<InviteUsersProps> = ({ organizationId, onInviteSent }) => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<InviteForm[]>([
    { email: '', role: 'member', message: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const addInviteField = () => {
    setInvites([...invites, { email: '', role: 'member', message: '' }]);
  };

  const removeInviteField = (index: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter((_, i) => i !== index));
    }
  };

  const updateInvite = (index: number, field: keyof InviteForm, value: string) => {
    const newInvites = [...invites];
    newInvites[index] = { ...newInvites[index], [field]: value };
    setInvites(newInvites);
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate all emails
    const validInvites = invites.filter(invite => 
      invite.email.trim() && validateEmail(invite.email.trim())
    );

    if (validInvites.length === 0) {
      setError('Veuillez saisir au moins une adresse email valide.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = await user.getIdToken(true);
      
      for (const invite of validInvites) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organization/${organizationId}/invite`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: invite.email.trim(),
            role: invite.role,
            message: invite.message.trim() || undefined
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Erreur lors de l\'envoi de l\'invitation');
        }
      }

      setSuccess(`${validInvites.length} invitation(s) envoyée(s) avec succès !`);
      setInvites([{ email: '', role: 'member', message: '' }]);
      onInviteSent();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi des invitations');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="invite-users-container">
      <div className="invite-header">
        <h3>👥 Inviter des utilisateurs</h3>
        <p>Envoyez des invitations à votre équipe pour rejoindre votre organisation</p>
      </div>

      {error && (
        <div className="invite-error">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="invite-success">
          ✅ {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="invite-form">
        <div className="invites-list">
          {invites.map((invite, index) => (
            <div key={index} className="invite-item">
              <div className="invite-item-header">
                <h4>Invitation {index + 1}</h4>
                {invites.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeInviteField(index)}
                    className="remove-invite-btn"
                    disabled={loading}
                  >
                    ❌
                  </button>
                )}
              </div>

              <div className="invite-fields">
                <div className="form-group">
                  <label htmlFor={`email-${index}`}>Adresse email *</label>
                  <input
                    type="email"
                    id={`email-${index}`}
                    value={invite.email}
                    onChange={(e) => updateInvite(index, 'email', e.target.value)}
                    placeholder="utilisateur@exemple.com"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor={`role-${index}`}>Rôle</label>
                  <select
                    id={`role-${index}`}
                    value={invite.role}
                    onChange={(e) => updateInvite(index, 'role', e.target.value as 'admin' | 'manager' | 'member')}
                    disabled={loading}
                  >
                    <option value="member">👤 Membre</option>
                    <option value="manager">👔 Manager</option>
                    <option value="admin">⚡ Administrateur</option>
                  </select>
                </div>

                <div className="form-group form-group-full">
                  <label htmlFor={`message-${index}`}>Message personnalisé (optionnel)</label>
                  <textarea
                    id={`message-${index}`}
                    value={invite.message}
                    onChange={(e) => updateInvite(index, 'message', e.target.value)}
                    placeholder="Un message d'accueil personnalisé..."
                    disabled={loading}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="invite-actions">
          <button
            type="button"
            onClick={addInviteField}
            className="btn btn-secondary add-invite-btn"
            disabled={loading}
          >
            ➕ Ajouter une invitation
          </button>

          <button
            type="submit"
            className="btn btn-primary send-invites-btn"
            disabled={loading || invites.every(invite => !invite.email.trim())}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Envoi en cours...
              </>
            ) : (
              '📧 Envoyer les invitations'
            )}
          </button>
        </div>
      </form>

      <div className="invite-info">
        <h4>ℹ️ Informations sur les rôles</h4>
        <div className="roles-info">
          <div className="role-info">
            <span className="role-badge member">👤 Membre</span>
            <p>Accès aux fonctionnalités de base, peut effectuer des analyses</p>
          </div>
          <div className="role-info">
            <span className="role-badge manager">👔 Manager</span>
            <p>Peut inviter des utilisateurs et voir les rapports d'équipe</p>
          </div>
          <div className="role-info">
            <span className="role-badge admin">⚡ Admin</span>
            <p>Accès complet, peut modifier les paramètres de l'organisation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteUsers;