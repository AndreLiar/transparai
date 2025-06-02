//src/components/LandingComponents/Header.tsx

// src/components/LandingComponents/Header.tsx
// src/components/LandingComponents/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import './Header.css';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="main-header">
      <div className="header-container">
        <div className="logo-section">
          <img src={logo} alt="TransparAI" />
          <span className="logo-text">TransparAI</span>
        </div>

        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/login" className="btn outline" onClick={() => setMenuOpen(false)}>Connexion</Link>
          <Link to="/signup" className="btn primary" onClick={() => setMenuOpen(false)}>S’inscrire</Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;

