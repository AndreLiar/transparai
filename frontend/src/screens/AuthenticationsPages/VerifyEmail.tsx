// src/screens/AuthenticationsPages/VerifyEmail.tsx
import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';
import './auth.css';

const VerifyEmail: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    setMessage('');
    setError('');
    if (!user) {
      setError("Aucun utilisateur connecté.");
      return;
    }

    try {
      await sendEmailVerification(user);
      setMessage("📩 Lien de vérification renvoyé !");
    } catch {
      setError("❌ Erreur lors de l’envoi de l’email.");
    }
  };

  const handleCheckAndGo = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        navigate('/dashboard');
      } else {
        setError("Votre email n’est pas encore vérifié.");
      }
    } catch {
      setError("Échec de la vérification.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo-section">
          <img src={logo} alt="TransparAI Logo" />
          <h2>Vérification email requise</h2>
          <p>
            Un email de vérification a été envoyé à <strong>{user?.email}</strong>.
            Merci de cliquer sur le lien dans votre boîte de réception.
          </p>
        </div>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="auth-button-group">
          <button onClick={handleResend} disabled={loading} className="btn outline">
            Renvoyer le lien
          </button>
          <button onClick={handleCheckAndGo} disabled={loading} className="btn primary">
            {loading ? 'Vérification...' : 'Accéder au tableau de bord'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
