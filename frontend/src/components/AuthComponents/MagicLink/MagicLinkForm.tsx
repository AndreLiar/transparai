// src/components/AuthComponents/MagicLink/MagicLinkForm.tsx
import React from 'react';

interface MagicLinkFormProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ email, onChange, onSubmit, loading }) => (
  <form onSubmit={onSubmit}>
    <div className="auth-field">
      <label htmlFor="magic-email">Adresse email</label>
      <input
        type="email"
        id="magic-email"
        required
        value={email}
        onChange={onChange}
        placeholder="vous@example.com"
      />
    </div>
    <button type="submit" className="auth-submit" disabled={loading}>
      {loading ? 'Envoi en cours...' : 'Envoyer le lien de connexion'}
    </button>
  </form>
);

export default MagicLinkForm;
