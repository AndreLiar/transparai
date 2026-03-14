// src/screens/AuthenticationsPages/Login.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '@/components/AuthComponents/Login/LoginForm';
import './auth.css';

const TRUST = [
  {
    title: 'Analyse en moins de 30 secondes',
    sub: 'GPT-4o lit et résume vos contrats instantanément.',
  },
  {
    title: 'Données hébergées en UE',
    sub: 'Microsoft Azure — Europe Ouest. Conforme RGPD.',
  },
  {
    title: 'Avis IA, pas juridique',
    sub: 'TransparAI assiste, ne remplace pas un avocat.',
  },
];

const Login: React.FC = () => (
  <div className="auth-shell">
    {/* ── Left brand panel ── */}
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
        {TRUST.map(({ title, sub }) => (
          <li className="auth-trust-item" key={title}>
            <span className="auth-trust-dot" />
            <div className="auth-trust-text">
              <strong>{title}</strong>
              <span>{sub}</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="auth-left-copy">
        &copy; {new Date().getFullYear()} TransparAI &mdash; Tous droits réservés
      </p>
    </div>

    {/* ── Right form panel ── */}
    <div className="auth-panel-right">
      <div className="auth-form-box">
        <Link to="/" className="auth-back">
          <span className="auth-back-arrow">&#8592;</span> Accueil
        </Link>

        <p className="auth-form-eyebrow">Espace client</p>
        <h2 className="auth-form-title">Connexion</h2>
        <p className="auth-form-subtitle">
          Pas encore de compte ?{' '}
          <Link to="/signup" style={{ color: 'var(--auth-red)', fontWeight: 700, textDecoration: 'none' }}>
            Créez-en un
          </Link>
        </p>

        <LoginForm />
      </div>
    </div>
  </div>
);

export default Login;
