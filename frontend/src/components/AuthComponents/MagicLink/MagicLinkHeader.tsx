// src/components/AuthComponents/MagicLink/MagicLinkHeader.tsx
// src/components/AuthComponents/MagicLink/MagicLinkHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import './magic-link.css';
const MagicLinkHeader: React.FC = () => (
  <div className="header">
    <Link to="/" className="auth-back-link" style={{ display: 'inline-block', marginBottom: '1rem', fontSize: '0.875rem', color: '#6b7280', textDecoration: 'none' }}>
      &larr; Retour à l'accueil
    </Link>
    <img
      src={logo}
      alt="TransparAI logo"
      className="header-logo"
    />
    <h2 className="header-title">Connexion par lien magique</h2>
    <p className="header-subtitle">Recevez un lien sécurisé dans votre boîte email</p>
  </div>
);

export default MagicLinkHeader;
