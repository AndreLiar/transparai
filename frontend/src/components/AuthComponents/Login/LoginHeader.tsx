import React from 'react';
import logo from '@/assets/logo.png';

const LoginHeader: React.FC = () => (
  <div className="text-center mb-4">
    <img
      src={logo}
      alt="TransparAI logo"
      style={{ height: '48px', maxWidth: '160px', objectFit: 'contain' }}
      className="mb-2"
    />
    <h2 className="text-primary fw-bold">Connexion</h2>
    <p className="text-muted mb-0">L’IA qui éclaire vos conditions d’abonnement.</p>
  </div>
);

export default LoginHeader;
