// src/components/LandingComponents/Pricing.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const Pricing: React.FC = () => (
  <section className="pricing-section">
    <div className="section-header">
      <h2 className="section-title">Choisissez la Transparence qui vous Convient</h2>
      <p className="section-subtitle">Découvrez l'abonnement parfait pour éclairer vos conditions avec élégance.</p>
    </div>

    <div className="pricing-grid">
      {/* Starter */}
      <div className="pricing-card">
        <h4 className="plan-title">Starter</h4>
        <p className="price">
          <span className="amount">Gratuit</span>
          <span className="frequency">pour toujours</span>
        </p>
        <ul className="features-list">
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            2 analyses / jour
          </li>
          <li className="unavailable">
            <svg className="feature-icon unavailable-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
            Export PDF
          </li>
        </ul>
        <Link to="/signup" className="btn btn-outline">Commencer</Link>
      </div>

      {/* Standard */}
      <div className="pricing-card highlight">
        <p className="ribbon">Le Plus Populaire</p>
        <h4 className="plan-title">Standard</h4>
        <p className="price">
          <span className="amount">9,99€</span>
          <span className="frequency">/mois</span>
        </p>
        <ul className="features-list">
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            10 analyses / jour
          </li>
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Historique
          </li>
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Export PDF
          </li>
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Support prioritaire
          </li>
        </ul>
        <Link to="/signup" className="btn btn-primary">Commencer</Link>
      </div>

      {/* Premium */}
      <div className="pricing-card">
        <h4 className="plan-title">Premium</h4>
        <p className="price">
          <span className="amount">19,99€</span>
          <span className="frequency">/mois</span>
        </p>
        <ul className="features-list">
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Analyses illimitées
          </li>
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Export PDF
          </li>
          <li>
            <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
            Accès anticipé aux nouvelles fonctionnalités
          </li>
        </ul>
        <Link to="/signup" className="btn btn-outline">Commencer</Link>
      </div>
    </div>

    <div className="cta-free">
      <h5 className="cta-title">Pas encore sûr ? Essayez TransparAI Gratuitement.</h5>
      <p className="cta-description">Découvrez comment l'IA éclaire vos conditions d'abonnement sans aucun engagement.</p>
      <Link to="/analyze" className="btn btn-primary btn-large">
        Essayez une analyse gratuite
      </Link>
    </div>
  </section>
);

export default Pricing;