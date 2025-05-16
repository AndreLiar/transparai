//src/components/LandingComponents/Header.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';

const Header: React.FC = () => (
  <header className="container py-2 d-flex justify-content-between align-items-center">
    <div className="d-flex align-items-center">
      <img
        src={logo}
        alt="TransparAI logo"
        style={{ height: '48px', maxWidth: '160px', objectFit: 'contain' }}
        className="me-2"
      />
      <span className="fs-5 fw-bold">TransparAI</span>
    </div>
    <div>
      <Link to="/login" className="btn btn-outline-primary me-2 btn-sm">Connexion</Link>
      <Link to="/signup" className="btn btn-primary btn-sm">S’inscrire</Link>
    </div>
  </header>
);

export default Header;
