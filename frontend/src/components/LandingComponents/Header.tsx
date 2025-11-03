// src/components/LandingComponents/Header.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '@/assets/logo.png';
import './Header.css';

const Header: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      closeMenu();
    }
  };

  return (
    <>
      <header className={`main-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <Link to="/" className="logo-section" onClick={closeMenu}>
            <img src={logo} alt="TransparAI Logo" />
            <span className="logo-text">TransparAI</span>
          </Link>

          <button
            className={`menu-toggle ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <div className="nav-menu">
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('features')}
              >
                Fonctionnalités
              </button>
              <button 
                className="nav-link" 
                onClick={() => scrollToSection('pricing')}
              >
                Tarifs
              </button>
              <Link 
                to="/analyze" 
                className="nav-link" 
                onClick={closeMenu}
              >
                Démo
              </Link>
              <Link 
                to="/contact" 
                className="nav-link" 
                onClick={closeMenu}
              >
                Contact
              </Link>
            </div>

            <div className="nav-buttons">
              <Link 
                to="/login" 
                className="btn outline" 
                onClick={closeMenu}
              >
                Connexion
              </Link>
              <Link 
                to="/signup" 
                className="btn primary" 
                onClick={closeMenu}
              >
                Essai Gratuit
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {menuOpen && (
        <div 
          className={`nav-overlay ${menuOpen ? 'open' : ''}`} 
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default Header;

