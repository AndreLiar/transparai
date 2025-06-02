// src/components/AuthComponents/MagicLink/MagicLinkHeader.tsx
// src/components/AuthComponents/MagicLink/MagicLinkHeader.tsx
import React from 'react';
import logo from '@/assets/logo.png';

const MagicLinkHeader: React.FC = () => (
  <div className="text-center mb-4">
    <img
      src={logo}
      alt="TransparAI logo"
      style={{ height: '48px', maxWidth: '160px', objectFit: 'contain' }}
      className="mb-2"
    />
    <h2 className="text-primary fw-bold">Connexion par lien magique 🔐</h2>
    <p className="text-muted mb-0">Recevez un lien sécurisé dans votre boîte email</p>
  </div>
);

export default MagicLinkHeader;
