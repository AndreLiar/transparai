// src/screens/AcceptInvitation/AcceptInvitation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { acceptInvitation } from '@/services/userManagementService';
import './AcceptInvitation.css';

const AcceptInvitation: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token d\'invitation manquant dans l\'URL.');
      return;
    }

    // If user is not logged in, redirect to signup first (recommended flow)
    if (!user) {
      navigate(`/signup?invitation=${token}`);
      return;
    }
  }, [token, user, navigate]);

  const handleAcceptInvitation = async () => {
    if (!user || !token) return;

    setLoading(true);
    setError('');

    try {
      const userToken = await user.getIdToken(true);
      const result = await acceptInvitation(userToken, token);
      
      setSuccess(true);
      
      // Redirect to organization dashboard after 2 seconds
      setTimeout(() => {
        navigate('/organization');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'acceptation de l\'invitation');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="invitation-page">
        <div className="invitation-card">
          <div className="invitation-error">
            <h2>❌ Lien d'invitation invalide</h2>
            <p>Le lien d'invitation est manquant ou invalide.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="invitation-page">
        <div className="invitation-card">
          <div className="invitation-loading">
            <h2>🔄 Redirection en cours...</h2>
            <p>Vous allez être redirigé vers la page de connexion.</p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="invitation-page">
        <div className="invitation-card">
          <div className="invitation-success">
            <h2>✅ Invitation acceptée !</h2>
            <p>Vous avez rejoint l'organisation avec succès.</p>
            <p>Redirection vers votre tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="invitation-page">
      <div className="invitation-card">
        <div className="invitation-header">
          <h2>📨 Invitation à rejoindre une organisation</h2>
          <p>Vous avez été invité(e) à rejoindre une organisation sur TransparAI.</p>
        </div>

        {error && (
          <div className="invitation-error">
            <p>{error}</p>
          </div>
        )}

        <div className="invitation-actions">
          <button 
            className="btn btn-primary"
            onClick={handleAcceptInvitation}
            disabled={loading}
          >
            {loading ? 'Acceptation en cours...' : 'Accepter l\'invitation'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            disabled={loading}
          >
            Ignorer
          </button>
        </div>

        <div className="invitation-info">
          <p><strong>Email connecté :</strong> {user.email}</p>
          <p>En acceptant cette invitation, vous rejoindrez l'organisation et votre compte sera automatiquement mis à niveau vers le plan Enterprise.</p>
        </div>
      </div>
    </div>
  );
};

export default AcceptInvitation;