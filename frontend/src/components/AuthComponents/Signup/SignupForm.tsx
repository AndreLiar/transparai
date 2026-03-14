// src/components/AuthComponents/Signup/SignupForm.tsx
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
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordFeedback, setPasswordFeedback] = useState<string | null>(null);

  useEffect(() => {
    setPasswordFeedback(validatePassword(password));
  }, [password]);

  return (
    <form onSubmit={onSubmit}>
      <div className="auth-field">
        <label htmlFor="signup-email">Adresse email</label>
        <input
          type="email"
          id="signup-email"
          required
          value={email}
          onChange={onChangeEmail}
          placeholder="vous@example.com"
        />
      </div>

      <div className="auth-field">
        <label htmlFor="signup-password">Mot de passe</label>
        <div className="auth-pw-row">
          <input
            type={showPassword ? 'text' : 'password'}
            id="signup-password"
            required
            value={password}
            onChange={onChangePassword}
            placeholder="Au moins 12 caractères"
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

      {error && <div className="auth-alert error">{error}</div>}

      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? 'Création...' : "S'inscrire"}
      </button>
    </form>
  );
};

export default SignupForm;
