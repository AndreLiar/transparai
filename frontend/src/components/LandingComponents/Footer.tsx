//src/components/LandingComponents/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // Ensure this path is correct

const Footer: React.FC = () => (
  <footer className="enhanced-footer">
    <div className="footer-content">
      <div className="footer-brand">
        <h3>TransparAI</h3>
        <p>L'intelligence artificielle au service de la transparence contractuelle</p>
        <div className="footer-badges">
          <span className="badge">🇫🇷 Made in France</span>
          <span className="badge">🛡️ RGPD Compliant</span>
        </div>
      </div>
      
      <div className="footer-links">
        <div className="link-group">
          <h4>Légal</h4>
          <Link to="/privacy-policy">Politique de Confidentialité</Link>
          <Link to="/terms-of-service">Conditions Générales</Link>
          <Link to="/cookies">Gestion des Cookies</Link>
        </div>
        
        <div className="link-group">
          <h4>Support</h4>
          <Link to="/contact">Contact</Link>
          <Link to="/help">Centre d'Aide</Link>
          <Link to="/faq">FAQ</Link>
        </div>
        
        <div className="link-group">
          <h4>Entreprise</h4>
          <Link to="/about">À Propos</Link>
          <Link to="/security">Sécurité</Link>
          <Link to="/api">API</Link>
        </div>

        <div className="link-group">
          <h4>Produit</h4>
          <Link to="/analyze">Analyser un document</Link>
        </div>
      </div>
    </div>
    
    <div className="footer-bottom">
      <p>
        © {new Date().getFullYear()} <span className="brand-name">TransparAI</span> – Tous droits réservés.
      </p>
    </div>
  </footer>
);

export default Footer;