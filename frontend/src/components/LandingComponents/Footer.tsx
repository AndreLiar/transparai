// src/components/LandingComponents/Footer.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="lp-footer">
    <div className="lp-footer-inner">
      <div className="lp-footer-brand">
        <span className="lp-footer-logo">TransparAI</span>
        <p className="lp-footer-tagline">
          L'intelligence artificielle au service<br />de la transparence contractuelle.
        </p>
        <p className="lp-footer-host">Données hébergées en UE · Microsoft Azure</p>
      </div>

      <div className="lp-footer-links">
        <div className="lp-footer-col">
          <h5 className="lp-footer-col-title">Légal</h5>
          <Link to="/privacy-policy" className="lp-footer-link">Politique de confidentialité</Link>
          <Link to="/terms-of-service" className="lp-footer-link">Conditions générales</Link>
          <Link to="/cookies" className="lp-footer-link">Gestion des cookies</Link>
        </div>

        <div className="lp-footer-col">
          <h5 className="lp-footer-col-title">Support</h5>
          <a href="mailto:contact@transparai.com" className="lp-footer-link">Contact</a>
          <a href="mailto:contact@transparai.com?subject=Question%20TransparAI" className="lp-footer-link">FAQ / Aide</a>
        </div>

        <div className="lp-footer-col">
          <h5 className="lp-footer-col-title">Produit</h5>
          <Link to="/analyze" className="lp-footer-link">Analyser un document</Link>
          <Link to="/signup" className="lp-footer-link">Créer un compte</Link>
        </div>
      </div>
    </div>

    <div className="lp-footer-bottom">
      <span>© {new Date().getFullYear()} TransparAI — Tous droits réservés.</span>
      <span className="lp-footer-rgpd">Conforme RGPD · EU AI Act Art. 13</span>
    </div>
  </footer>
);

export default Footer;
