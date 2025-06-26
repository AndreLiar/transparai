//src/components/LandingComponents/Footer.tsx
import React from 'react';
import './Footer.css'; // Ensure this path is correct

const Footer: React.FC = () => (
  <footer className="site-footer">
    <div className="footer-content">
      <p className="copyright-text">
        © {new Date().getFullYear()} <span className="brand-name">TransparAI</span> – Tous droits réservés.
      </p>
      
          <div className="footer-links">
            <a href="/privacy" className="footer-link">Politique de Confidentialité</a>
            <span className="separator">|</span>
            <a href="/terms" className="footer-link">Conditions Générales</a>
            <span className="separator">|</span>
            <a href="/contact" className="footer-link">Contact</a>
          </div>
          <div className="social-media">
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            <a href="#" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
          </div>
      
    </div>
  </footer>
);

export default Footer;