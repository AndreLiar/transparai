// src/screens/AuthenticationsPages/MagicLink.tsx
import React, { useEffect, useState } from 'react';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import { Link, useNavigate } from 'react-router-dom';

import MagicLinkForm from '@/components/AuthComponents/MagicLink/MagicLinkForm';
import MagicLinkMessage from '@/components/AuthComponents/MagicLink/MagicLinkMessage';
import './auth.css';

const MagicLink: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completeMagicLogin = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const storedEmail = window.localStorage.getItem('emailForSignIn');
        const emailToUse = storedEmail || window.prompt('Entrez votre email pour confirmer');

        if (!emailToUse) {
          setError('Email requis pour terminer la connexion.');
          return;
        }

        try {
          await setPersistence(auth, browserSessionPersistence);
          await signInWithEmailLink(auth, emailToUse, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          navigate('/dashboard');
        } catch {
          setError('Lien invalide ou expiré.');
        }
      }
    };

    completeMagicLogin();
  }, [navigate]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/magic-link`,
        handleCodeInApp: true,
      });
      window.localStorage.setItem('emailForSignIn', email);
      setMessage('Lien envoyé. Vérifiez votre boîte de réception.');
    } catch {
      setError("Erreur lors de l'envoi du lien.");
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
          <p className="auth-left-tagline">Connexion sans mot de passe</p>
          <p className="auth-left-desc">
            Recevez un lien de connexion sécurisé directement dans votre boîte email —
            aucun mot de passe à retenir.
          </p>
        </div>
        <ul className="auth-trust-list">
          <li className="auth-trust-item">
            <span className="auth-trust-dot" />
            <div className="auth-trust-text">
              <strong>Lien valable 1 heure</strong>
              <span>Expiré après usage pour votre sécurité.</span>
            </div>
          </li>
          <li className="auth-trust-item">
            <span className="auth-trust-dot" />
            <div className="auth-trust-text">
              <strong>Zéro mot de passe stocké</strong>
              <span>Authentification Firebase — standard industrie.</span>
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

          <p className="auth-form-eyebrow">Lien magique</p>
          <h2 className="auth-form-title">Connexion par email</h2>
          <p className="auth-form-subtitle">
            Saisissez votre email — vous recevrez un lien de connexion instantané.
          </p>

          <MagicLinkMessage message={message} error={error} />
          <MagicLinkForm
            email={email}
            onChange={(e) => setEmail(e.target.value)}
            onSubmit={handleSendLink}
            loading={loading}
          />

          <div className="auth-links" style={{ marginTop: '24px' }}>
            <div className="auth-link-row">
              Préférez-vous un mot de passe ? <Link to="/login">Se connecter</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MagicLink;
