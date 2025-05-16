//src/components/LandingComponents/Pricing.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Pricing: React.FC = () => (
  <section className="py-5 bg-white">
    <div className="container">
      <h2 className="text-center mb-5">Tarification</h2>
      <div className="row justify-content-center">
        {/* Starter */}
        <div className="col-md-4 mb-3">
          <div className="border rounded p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h4>Starter</h4>
              <p className="fs-5 fw-bold">Gratuit</p>
              <ul className="list-unstyled">
                <li>✅ 10 analyses/jour</li>
                <li>✅ Export PDF</li>
              </ul>
            </div>
            <Link to="/signup" className="btn btn-outline-primary mt-3">Commencer</Link>
          </div>
        </div>

        {/* Standard */}
        <div className="col-md-4 mb-3">
          <div className="border rounded p-4 h-100 border-primary d-flex flex-column justify-content-between">
            <div>
              <h4>Standard</h4>
              <p className="fs-5 fw-bold">2€/mois</p>
              <ul className="list-unstyled">
                <li>✅ 40 analyses/jour</li>
                <li>✅ Historique</li>
                <li>✅ Support prioritaire</li>
              </ul>
            </div>
            <Link to="/signup" className="btn btn-primary mt-3">Commencer</Link>
          </div>
        </div>

        {/* Premium */}
        <div className="col-md-4 mb-3">
          <div className="border rounded p-4 h-100 d-flex flex-column justify-content-between">
            <div>
              <h4>Premium</h4>
              <p className="fs-5 fw-bold">5€/mois</p>
              <ul className="list-unstyled">
                <li>✅ Illimité</li>
                <li>✅ Accès anticipé aux nouvelles fonctionnalités</li>
              </ul>
            </div>
            <Link to="/signup" className="btn btn-outline-primary mt-3">Commencer</Link>
          </div>
        </div>
      </div>

      <div className="text-center mt-5">
        <h5 className="mb-3">Pas encore sûr ?</h5>
        <Link to="/analyze" className="btn btn-lg btn-success px-5">
          Essayez gratuitement une analyse
        </Link>
      </div>
    </div>
  </section>
);

export default Pricing;
