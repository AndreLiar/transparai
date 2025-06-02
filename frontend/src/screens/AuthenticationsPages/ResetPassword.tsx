//src/screens/AuthenticationsPages/ResetPassword.tsx

import React, { useState } from 'react';
import { auth } from '@/configFirebase/Firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

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
    } catch (err: any) {
      setError("❌ Impossible d'envoyer l'email. Vérifiez l'adresse.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm border-0 rounded-4 p-4 w-100" style={{ maxWidth: 500 }}>
        <div className="text-center mb-3">
          <img
            src={logo}
            alt="TransparAI Logo"
            style={{ height: '48px', maxWidth: '160px', objectFit: 'contain' }}
            className="mb-2"
          />
          <h2 className="text-primary fw-bold">Réinitialiser le mot de passe</h2>
          <p className="text-muted mb-0">Recevez un lien pour créer un nouveau mot de passe.</p>
        </div>

        <form onSubmit={handleReset} className="mt-3">
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Adresse email</label>
            <input
              type="email"
              id="email"
              className="form-control"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: vous@example.com"
            />
          </div>

          {message && <div className="alert alert-success text-center">{message}</div>}
          {error && <div className="alert alert-danger text-center">{error}</div>}

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Envoi...' : 'Envoyer le lien de réinitialisation'}
          </button>
        </form>

        <div className="text-center mt-3">
          <Link to="/login" className="text-decoration-none">← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
