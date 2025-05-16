// src/components/Features.tsx
import React from 'react';

const Features: React.FC = () => (
  <section className="py-5 bg-light">
    <div className="container">
      <h2 className="text-center mb-5">Fonctionnalités principales</h2>
      <div className="row text-center">
        <div className="col-md-4 mb-4">
          <h4>🤖 Analyse IA</h4>
          <p>Compréhension intelligente des CGA</p>
        </div>
        <div className="col-md-4 mb-4">
          <h4>📊 Score de transparence</h4>
          <p>Note de clarté sur 100</p>
        </div>
        <div className="col-md-4 mb-4">
          <h4>🚩 Clauses sensibles</h4>
          <p>Repérage automatique des pièges contractuels</p>
        </div>
      </div>
    </div>
  </section>
);

export default Features;
