// src/screens/AuthenticationsPages/Signup.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '@/configFirebase/Firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

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
    sub: 'Microsoft Azure — Europe Ouest. Conforme RGPD.',
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
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const invitationToken = searchParams.get('invitation');

  useEffect(() => {
    if (invitationToken) {
      loadInvitationDetails();
    }
  }, [invitationToken]);

  const loadInvitationDetails = async () => {
    setLoadingInvitation(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organization/invitation/${invitationToken}`);
      if (response.ok) {
        const details = await response.json();
        setInvitationDetails(details);
        setEmail(details.email);
      } else {
        setError('Invitation invalide ou expirée.');
      }
    } catch {
      setError("Erreur lors du chargement de l'invitation.");
    } finally {
      setLoadingInvitation(false);
    }
  };

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
    if (invitationToken) {
      navigate(`/verify-email?invitation=${invitationToken}`);
    } else {
      navigate('/verify-email');
    }
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

          {loadingInvitation && (
            <div className="auth-alert success" style={{ marginBottom: '24px' }}>
              Chargement de l'invitation...
            </div>
          )}

          {invitationDetails && (
            <div className="auth-invite-notice">
              <strong>Invitation — {invitationDetails.organizationName}</strong>
              {invitationDetails.inviterName} vous invite en tant que {invitationDetails.role}.
              {invitationDetails.customMessage && (
                <span style={{ display: 'block', fontStyle: 'italic', marginTop: '4px' }}>
                  "{invitationDetails.customMessage}"
                </span>
              )}
            </div>
          )}

          <p className="auth-form-eyebrow">Nouveau compte</p>
          <h2 className="auth-form-title">
            {invitationDetails ? 'Créer votre compte' : 'Créer un compte'}
          </h2>
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
