//src/components/AuthComponents/Login/LoginHeader.tsx
// src/components/AuthComponents/Login/LoginHeader.tsx
import React from 'react';
import logo from '@/assets/logo.png';
import './LoginHeader.css';

const LoginHeader: React.FC = () => (
  <div className="login-header">
    <img
      src={logo}
      alt="TransparAI logo"
      className="login-logo"
    />
    <h2 className="login-title">Connexion</h2>
    <p className="login-subtitle">L’IA qui éclaire vos conditions d’abonnement.</p>
  </div>
);

export default LoginHeader;
