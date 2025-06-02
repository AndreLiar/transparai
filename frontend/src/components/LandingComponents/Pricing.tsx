//src/components/LandingComponents/Pricing.tsx
// src/components/LandingComponents/Pricing.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing: React.FC = () => (
  <section className="pricing-section">
    <h2 className="section-title">Tarification</h2>
    <div className="pricing-grid">
      {/* Starter */}
      <div className="pricing-card">
        <h4>Starter</h4>
        <p className="price">Gratuit</p>
        <ul>
          <li>✅ 10 analyses/jour</li>
          <li>✅ Export PDF</li>
        </ul>
        <Link to="/signup" className="btn outline">Commencer</Link>
      </div>

      {/* Standard */}
      <div className="pricing-card highlight">
        <h4>Standard</h4>
        <p className="price">2€/mois</p>
        <ul>
          <li>✅ 40 analyses/jour</li>
          <li>✅ Historique</li>
          <li>✅ Support prioritaire</li>
        </ul>
        <Link to="/signup" className="btn primary">Commencer</Link>
      </div>

      {/* Premium */}
      <div className="pricing-card">
        <h4>Premium</h4>
        <p className="price">5€/mois</p>
        <ul>
          <li>✅ Illimité</li>
          <li>✅ Accès anticipé aux nouvelles fonctionnalités</li>
        </ul>
        <Link to="/signup" className="btn outline">Commencer</Link>
      </div>
    </div>

    <div className="cta-free">
      <h5>Pas encore sûr ?</h5>
      <Link to="/analyze" className="btn primary large">
        Essayez gratuitement une analyse
      </Link>
    </div>
  </section>
);

export default Pricing;
