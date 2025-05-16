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
    <div className="mb-3">
      <label htmlFor="email" className="form-label">Adresse email</label>
      <input
        type="email"
        id="email"
        className="form-control"
        required
        value={email}
        onChange={onChange}
        placeholder="nom@exemple.com"
      />
    </div>
    <button type="submit" className="btn btn-primary w-100" disabled={loading}>
      {loading ? 'Envoi en cours...' : 'Envoyer le lien de connexion'}
    </button>
  </form>
);

export default MagicLinkForm;
