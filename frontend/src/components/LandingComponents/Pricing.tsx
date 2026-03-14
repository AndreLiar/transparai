// src/components/LandingComponents/Pricing.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import './Pricing.css';

const CheckIcon: React.FC = () => (
  <svg className="feature-icon" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
  </svg>
);

const Pricing: React.FC = () => (
  <section className="pricing-section">
    <div className="pricing-inner">
      <div className="section-header">
        <span className="pricing-label">Tarifs</span>
        <h2 className="section-title">Simple et transparent</h2>
        <p className="section-subtitle">Des tarifs pensés pour les particuliers, les professionnels et les équipes juridiques.</p>
      </div>

      <div className="pricing-grid">

        {/* Free */}
        <div className="pricing-card">
          <h4 className="plan-title">Gratuit</h4>
          <p className="price">
            <span className="amount">0 €</span>
            <span className="frequency">pour toujours</span>
          </p>
          <p className="plan-description">Pour découvrir TransparAI sans engagement.</p>
          <ul className="features-list">
            <li><CheckIcon />5 analyses / mois</li>
            <li><CheckIcon />Saisie de texte</li>
            <li><CheckIcon />Analyse IA (GPT-4o mini)</li>
            <li><CheckIcon />Score de transparence</li>
          </ul>
          <Link to="/signup" className="btn btn-outline">Commencer</Link>
        </div>

        {/* Standard — most popular */}
        <div className="pricing-card highlight">
          <p className="ribbon">Le Plus Populaire</p>
          <h4 className="plan-title">Standard</h4>
          <p className="price">
            <span className="amount">14,99 €</span>
            <span className="frequency">/mois</span>
          </p>
          <p className="plan-description">Pour les particuliers actifs qui signent régulièrement des contrats.</p>
          <ul className="features-list">
            <li><CheckIcon />100 analyses / mois</li>
            <li><CheckIcon />Upload PDF &amp; OCR</li>
            <li><CheckIcon />Analyse IA avancée (GPT-4o mini)</li>
            <li><CheckIcon />Historique 90 jours</li>
            <li><CheckIcon />Export PDF</li>
            <li><CheckIcon />Documents jusqu'à 100 000 caractères</li>
          </ul>
          <Link to="/signup" className="btn btn-primary">Commencer</Link>
        </div>

        {/* Premium */}
        <div className="pricing-card">
          <h4 className="plan-title">Premium</h4>
          <p className="price">
            <span className="amount">29,99 €</span>
            <span className="frequency">/mois</span>
          </p>
          <p className="plan-description">Pour les professionnels, freelances et juristes indépendants.</p>
          <ul className="features-list">
            <li><CheckIcon />Analyses illimitées</li>
            <li><CheckIcon />IA haute précision (GPT-4o)</li>
            <li><CheckIcon />Historique 2 ans</li>
            <li><CheckIcon />Export PDF</li>
            <li><CheckIcon />Support prioritaire</li>
          </ul>
          <Link to="/signup" className="btn btn-outline">Commencer</Link>
        </div>

        {/* Enterprise */}
        <div className="pricing-card enterprise">
          <span className="enterprise-banner">Entreprise</span>
          <h4 className="plan-title">Enterprise</h4>
          <p className="price">
            <span className="amount">199 €</span>
            <span className="frequency">/mois</span>
          </p>
          <p className="plan-description">Pour les cabinets juridiques, équipes compliance et LegalTech.</p>
          <ul className="features-list">
            <li><CheckIcon />Analyses illimitées pour l'équipe</li>
            <li><CheckIcon />GPT-4o prioritaire</li>
            <li><CheckIcon />Gestion multi-utilisateurs</li>
            <li><CheckIcon />Journal d'audit (EU AI Act Art. 12)</li>
            <li><CheckIcon />SLA garanti &amp; support dédié</li>
          </ul>
          <Link to="/signup" className="btn btn-primary">Contacter l'équipe</Link>
        </div>

      </div>

      <p className="pricing-note">
        Tous les plans incluent le chiffrement des données, la conformité RGPD et la déclaration EU AI Act Art. 13.
      </p>

      <div className="cta-free">
        <h5 className="cta-title">Pas encore sûr ? Essayez gratuitement.</h5>
        <p className="cta-description">5 analyses gratuites, sans carte bancaire, sans engagement.</p>
        <Link to="/analyze" className="btn btn-primary btn-large">
          Analyser un contrat
        </Link>
      </div>
    </div>
  </section>
);

export default Pricing;
