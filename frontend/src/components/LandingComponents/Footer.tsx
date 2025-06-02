//src/components/LandingComponents/Footer.tsx
// src/components/LandingComponents/Footer.tsx
import React from 'react';
import './Footer.css';

const Footer: React.FC = () => (
  <footer className="footer">
    <small>© {new Date().getFullYear()} TransparAI – Tous droits réservés</small>
  </footer>
);

export default Footer;
