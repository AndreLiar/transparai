// src/components/LandingComponents/Features.tsx
// src/components/Features.tsx
import React from 'react';
import './Features.css';

const Features: React.FC = () => (
  <section className="features-section">
    <div className="features-container">
      <h2 className="features-title">Fonctionnalités principales</h2>
      <div className="features-grid">
        <div className="feature-card">
          <h4>🤖 Analyse IA</h4>
          <p>Compréhension intelligente des CGA</p>
        </div>
        <div className="feature-card">
          <h4>📊 Score de transparence</h4>
          <p>Note de clarté sur 100</p>
        </div>
        <div className="feature-card">
          <h4>🚩 Clauses sensibles</h4>
          <p>Repérage automatique des pièges contractuels</p>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
