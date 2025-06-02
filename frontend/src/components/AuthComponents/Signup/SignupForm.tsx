//src/components/AuthComponents/SignupForm.tsx
import React, { useState, useEffect } from 'react';
import { validatePassword } from '@/utils/validatePassword';
import './signup.css';

export interface SignupFormProps {
  email: string;
  password: string;
  onChangeEmail: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePassword: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error?: string | null;
}

const SignupForm: React.FC<SignupFormProps> = ({
  email,
  password,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  loading,
  error
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  useEffect(() => {
    setPasswordFeedback(validatePassword(password));
  }, [password]);

  return (
    <form onSubmit={onSubmit} className="form">
      <div className="form-group">
        <label htmlFor="email">Adresse email</label>
        <input
          type="email"
          id="email"
          required
          value={email}
          onChange={onChangeEmail}
          placeholder="ex: vous@example.com"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Mot de passe</label>
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            required
            value={password}
            onChange={onChangePassword}
            placeholder="Au moins 12 caractères"
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? 'Cacher' : 'Voir'}
          </button>
        </div>
        {password && passwordFeedback && (
          <div className="form-feedback error">{passwordFeedback}</div>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      <button type="submit" className="btn-primary" disabled={loading}>
        {loading ? 'Création...' : "S'inscrire"}
      </button>

      <p className="link-text">
        Déjà inscrit ? <a href="/login">Se connecter</a>
      </p>
    </form>
  );
};

export default SignupForm;
