// src/screens/AuthenticationsPages/Signup.tsx
import React, { useState } from 'react';
import { auth } from '@/configFirebase/Firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

import SignupForm from '@/components/AuthComponents/Signup/SignupForm';
import VerificationModal from '@/components/AuthComponents/Signup/VerificationModal';
import { validatePassword } from '@/utils/validatePassword';
import { validateEmail } from '@/utils/validateEmail';
import './auth.css';

const TRUST = [
  {
    title: '5 analyses gratuites',
    sub: 'Sans carte bancaire, sans engagement.',
  },
  {
    title: 'Données hébergées en UE',
    sub: 'Infrastructure cloud — Europe. Conforme RGPD.',
  },
  {
    title: 'Résultats en 30 secondes',
    sub: 'Score, résumé et clauses à risque immédiatement.',
  },
];

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setError(emailError || passwordError);
      setLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/verify-email');
  };

  return (
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

          <p className="auth-form-eyebrow">Nouveau compte</p>
          <h2 className="auth-form-title">Créer un compte</h2>
          <p className="auth-form-subtitle">
            Déjà inscrit ?{' '}
            <Link to="/login" style={{ color: 'var(--auth-red)', fontWeight: 700, textDecoration: 'none' }}>
              Se connecter
            </Link>
          </p>

          <SignupForm
            email={email}
            password={password}
            onChangeEmail={(e) => setEmail(e.target.value)}
            onChangePassword={(e) => setPassword(e.target.value)}
            onSubmit={handleSignup}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      <VerificationModal show={showModal} email={email} onClose={handleModalClose} />
    </div>
  );
};

export default Signup;
