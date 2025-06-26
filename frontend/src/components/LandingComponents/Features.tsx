// src/components/LandingComponents/Features.tsx
import React from 'react';
import './Features.css'; // Make sure this path is correct

const features = [
  // Using more descriptive, slightly refined icons (can be replaced with SVGs for true luxury)
  { icon: '🧠', title: 'Analyse IA Avancée', desc: 'Résumé, score et identification de clauses clés, propulsés par Gemini 2.0 Flash.' },
  { icon: '📑', title: 'Formats Multiples Supportés', desc: 'Extraction de texte native enrichie par l\'OCR Tesseract.js pour PDF et images.' },
  { icon: '✨', title: 'Score de Transparence Détaillé', desc: 'Évaluation objective de la lisibilité et clarté de vos documents sur une échelle de 100.' },
  { icon: '⚠️', title: 'Détection Intelligente de Clauses', desc: 'Identification proactive des pièges contractuels et des clauses sensibles.' },
  { icon: ' archivage', title: 'Historique d\'Analyses Complet', desc: 'Accédez à toutes vos analyses passées, sécurisées et organisées.' },
  { icon: '⬇️', title: 'Exportation PDF Premium', desc: 'Générez des rapports PDF élégants de vos analyses (fonctionnalité réservée aux abonnés).' },
  { icon: ' secure', title: 'Gestion d\'Abonnements Sécurisée', desc: 'Plans Starter, Standard, Premium gérés via Stripe avec une intégration robuste.' },
  { icon: '🔑', title: 'Authentification Flexible', desc: 'Connexion sécurisée par email/mot de passe, lien magique, vérification et réinitialisation.' },
  { icon: '🗑️', title: 'Contrôle Total des Données', desc: 'Option de suppression complète de votre compte et de toutes les données associées.' },
  { icon: '🔄', title: 'Quotas Intelligents & Adaptatifs', desc: 'Vos analyses se réinitialisent quotidiennement, adaptées à votre plan d\'abonnement.' },
  { icon: '✅', title: 'Conformité RGPD Garantie', desc: 'Un engagement inébranlable envers la protection de votre vie privée et la gestion de vos données.' },
];

const Features: React.FC = () => (
  <section className="features-section">
    <div className="features-container">
      <h2 className="features-title">L'Excellence au Cœur de Chaque Fonctionnalité</h2>
      <p className="features-subtitle">
        Conçues pour la clarté et la protection, nos fonctionnalités s'intègrent
        parfaitement pour vous offrir une expérience inégalée.
      </p>
      <div className="features-grid">
        {features.map(({ icon, title, desc }, idx) => (
          <div className="feature-card" key={idx}>
            <div className="feature-icon-wrapper">
              <span className="feature-icon-emoji">{icon}</span>
            </div>
            <h5 className="feature-title">{title}</h5>
            <p className="feature-description">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;