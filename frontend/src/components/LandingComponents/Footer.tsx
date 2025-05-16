//src/components/LandingComponents/Footer.tsx
import React from 'react';

const Footer: React.FC = () => (
  <footer className="bg-dark text-light text-center py-3 mt-auto">
    <small>© {new Date().getFullYear()} TransparAI – Tous droits réservés</small>
  </footer>
);

export default Footer;
