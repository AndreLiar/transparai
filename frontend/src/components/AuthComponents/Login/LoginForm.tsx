//src/components/AuthComponents/LoginForm.tsx
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
      await setPersistence(auth, browserSessionPersistence); // ✅ secure session
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMsg('Email ou mot de passe incorrect.');
      setShowError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleLogin}>
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

        <div className="mb-3">
          <label htmlFor="password" className="form-label">Mot de passe</label>
          <div className="input-group">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-control"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Cacher' : 'Voir'}
            </button>
          </div>
          {password && passwordFeedback && (
            <div className="form-text text-danger">{passwordFeedback}</div>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <div className="text-center mt-3">
        <Link to="/reset-password" className="text-decoration-none">Mot de passe oublié ?</Link>
      </div>

      <div className="text-center mt-2">
        <span>Ou utilisez un </span>
        <Link to="/magic-link" className="text-decoration-none fw-semibold text-primary">
          lien magique
        </Link>
      </div>

      <div className="text-center mt-2">
        <span>Vous n’avez pas encore de compte ? </span>
        <Link to="/signup" className="text-decoration-none fw-semibold text-primary">
          Créez-en un
        </Link>
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
