// src/components/AuthComponents/MagicLink/MagicLinkForm.tsx
import React from 'react';
import './magic-link.css';
interface MagicLinkFormProps {
  email: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}

const MagicLinkForm: React.FC<MagicLinkFormProps> = ({ email, onChange, onSubmit, loading }) => (
  <form onSubmit={onSubmit} className="form">
    <div className="form-group">
      <label htmlFor="email">Adresse email</label>
      <input
        type="email"
        id="email"
        required
        value={email}
        onChange={onChange}
        placeholder="nom@exemple.com"
      />
    </div>
    <button type="submit" className="btn-primary" disabled={loading}>
      {loading ? 'Envoi en cours...' : 'Envoyer le lien de connexion'}
    </button>
  </form>
);

export default MagicLinkForm;
