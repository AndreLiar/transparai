// src/screens/AuthenticationsPages/ResetPassword.tsx
import React, { useState } from 'react';
import { auth } from '@/configFirebase/Firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import './auth.css';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("📩 Un lien de réinitialisation a été envoyé à votre adresse email.");
    } catch {
      setError("❌ Impossible d'envoyer l'email. Vérifiez l'adresse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo-section">
          <img src={logo} alt="TransparAI Logo" />
          <h2>Réinitialiser le mot de passe</h2>
          <p>Recevez un lien pour créer un nouveau mot de passe.</p>
        </div>

        <form onSubmit={handleReset} className="auth-form">
          <label htmlFor="email">Adresse email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: vous@example.com"
          />

          {message && <div className="alert success">{message}</div>}
          {error && <div className="alert error">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        <div className="auth-footer-link">
          <Link to="/login">← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
