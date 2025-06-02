// src/components/AuthComponents/MagicLink/MagicLinkHeader.tsx
// src/components/AuthComponents/MagicLink/MagicLinkHeader.tsx
import React from 'react';
import logo from '@/assets/logo.png';
import './magic-link.css';
const MagicLinkHeader: React.FC = () => (
  <div className="header">
    <img
      src={logo}
      alt="TransparAI logo"
      className="header-logo"
    />
    <h2 className="header-title">Connexion par lien magique 🔐</h2>
    <p className="header-subtitle">Recevez un lien sécurisé dans votre boîte email</p>
  </div>
);

export default MagicLinkHeader;
