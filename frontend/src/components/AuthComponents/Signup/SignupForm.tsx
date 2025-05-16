//src/components/AuthComponents/SignupForm.tsx
import React, { useState, useEffect } from 'react';
import { validatePassword } from '@/utils/validatePassword';

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
    <form onSubmit={onSubmit} className="mt-3">
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Adresse email</label>
        <input
          type="email"
          id="email"
          className="form-control"
          required
          value={email}
          onChange={onChangeEmail}
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
            onChange={onChangePassword}
            placeholder="Au moins 12 caractères"
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

      {error && <div className="alert alert-danger text-center">{error}</div>}

      <button type="submit" className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Création...' : "S'inscrire"}
      </button>

      <p className="text-center mt-3 mb-0">
        Déjà inscrit ? <a href="/login" className="text-decoration-none">Se connecter</a>
      </p>
    </form>
  );
};

export default SignupForm;
