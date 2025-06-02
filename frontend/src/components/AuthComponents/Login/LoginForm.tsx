//src/components/AuthComponents/Login/LoginForm.tsx
// src/components/AuthComponents/Login/LoginForm.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '@/configFirebase/Firebase';
import {
  signInWithEmailAndPassword,
  setPersistence,
  browserSessionPersistence,
} from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
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
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg('Email ou mot de passe incorrect.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form className="login-form" onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">Adresse email</label>
          <input
            type="email"
            id="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ex: vous@example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mot de passe</label>
          <div className="password-group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Cacher' : 'Voir'}
            </button>
          </div>
          {password && passwordFeedback && (
            <div className="password-feedback">{passwordFeedback}</div>
          )}
        </div>

        <button type="submit" className="btn-primary full-width" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="form-links">
        <Link to="/reset-password">Mot de passe oublié ?</Link>
        <div>
          <span>Ou utilisez un </span>
          <Link to="/magic-link" className="highlight-link">lien magique</Link>
        </div>
        <div>
          <span>Vous n’avez pas encore de compte ? </span>
          <Link to="/signup" className="highlight-link">Créez-en un</Link>
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
