// src/screens/AuthenticationsPages/ResetPassword.tsx
import React, { useState } from 'react';
import { auth } from '@/configFirebase/Firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
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
      setMessage("Un lien de réinitialisation a été envoyé à votre adresse email.");
    } catch {
      setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      {/* ── Left panel ── */}
      <div className="auth-panel-left">
        <div className="auth-left-top">
          <p className="auth-left-dateline">Analyse de documents &mdash; IA &amp; Droit</p>
          <hr className="auth-left-rule" />
          <h1 className="auth-left-brand">TransparAI</h1>
          <hr className="auth-left-rule-bottom" />
          <p className="auth-left-tagline">Intelligence contractuelle</p>
          <p className="auth-left-desc">
            Comprenez ce que vous signez. Résumé clair, score de transparence
            et détection des clauses à risque — en 30 secondes.
          </p>
        </div>
        <ul className="auth-trust-list">
          <li className="auth-trust-item">
            <span className="auth-trust-dot" />
            <div className="auth-trust-text">
              <strong>Lien sécurisé par Firebase</strong>
              <span>Votre mot de passe n'est jamais stocké en clair.</span>
            </div>
          </li>
          <li className="auth-trust-item">
            <span className="auth-trust-dot" />
            <div className="auth-trust-text">
              <strong>Données hébergées en UE</strong>
              <span>Microsoft Azure — Europe Ouest. Conforme RGPD.</span>
            </div>
          </li>
        </ul>
        <p className="auth-left-copy">
          &copy; {new Date().getFullYear()} TransparAI &mdash; Tous droits réservés
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="auth-panel-right">
        <div className="auth-form-box">
          <Link to="/login" className="auth-back">
            <span className="auth-back-arrow">&#8592;</span> Connexion
          </Link>

          <p className="auth-form-eyebrow">Sécurité du compte</p>
          <h2 className="auth-form-title">Réinitialiser le mot de passe</h2>
          <p className="auth-form-subtitle">
            Saisissez votre adresse email — nous vous enverrons un lien pour créer un nouveau mot de passe.
          </p>

          {message && <div className="auth-alert success">{message}</div>}
          {error && <div className="auth-alert error">{error}</div>}

          <form onSubmit={handleReset}>
            <div className="auth-field">
              <label htmlFor="reset-email">Adresse email</label>
              <input
                type="email"
                id="reset-email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@example.com"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </form>

          <div className="auth-links" style={{ marginTop: '24px' }}>
            <div className="auth-link-row">
              Pas encore de compte ? <Link to="/signup">Créez-en un</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
