// src/components/AuthComponents/Login/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '@/configFirebase/Firebase';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import { validatePassword } from '@/utils/validatePassword';
import LoginErrorModal from './LoginErrorModal';
import './LoginForm.css';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const invitationToken = searchParams.get('invitation');

  useEffect(() => {
    if (password) {
      setPasswordFeedback(validatePassword(password));
    } else {
      setPasswordFeedback(null);
    }
  }, [password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await setPersistence(auth, browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);

      if (invitationToken) {
        navigate(`/accept-invitation?token=${invitationToken}`);
      } else {
        const from = (location.state as { from?: string })?.from;
        navigate(from ?? '/dashboard');
      }
    } catch (err: any) {
      setErrorMsg('Email ou mot de passe incorrect.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {invitationToken && (
        <div className="invitation-notice">
          <div className="invitation-notice-content">
            <h3>Invitation à rejoindre une organisation</h3>
            <p>Connectez-vous pour accepter l'invitation.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleLogin}>
        <div className="auth-field">
          <label htmlFor="email">Adresse email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@example.com"
          />
        </div>

        <div className="auth-field">
          <label htmlFor="password">Mot de passe</label>
          <div className="auth-pw-row">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
            <button
              type="button"
              className="auth-pw-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Cacher' : 'Voir'}
            </button>
          </div>
          {password && passwordFeedback && (
            <div className="auth-field-feedback">{passwordFeedback}</div>
          )}
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="auth-links">
        <div className="auth-link-row">
          <Link to="/reset-password">Mot de passe oublié ?</Link>
        </div>
        <div className="auth-link-row">
          Ou connectez-vous avec un{' '}
          <Link to="/magic-link">lien magique</Link>
        </div>
      </div>

      <LoginErrorModal
        show={showError}
        onClose={() => setShowError(false)}
        message={errorMsg}
      />
    </>
  );
};

export default LoginForm;
