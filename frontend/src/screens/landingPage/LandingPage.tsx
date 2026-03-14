import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

import Header from '@/components/LandingComponents/Header';
import Pricing from '@/components/LandingComponents/Pricing';
import Footer from '@/components/LandingComponents/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  viewport: { once: true, margin: '-80px' },
};

const LandingPage: React.FC = () => (
  <div className="landing-wrapper">
    <Header />

    {/* ── Hero ─────────────────────────────────────────────── */}
    <motion.section className="hero-section" {...fadeInUp}>
      <div className="hero-content">
        <div className="hero-badge">
          <span>🇪🇺</span>
          <span>Données hébergées en UE · Conforme RGPD</span>
        </div>

        <h1 className="hero-title">
          Vous signez sans avocat ?<br />
          Lisez vraiment ce que vous <span className="hero-highlight">acceptez</span>
        </h1>

        <p className="hero-subtitle">
          TransparAI analyse vos contrats, CGU et CGV en moins de 30 secondes.
          Résumé clair, score de transparence, clauses à risque — sans jargon juridique.
        </p>

        <div className="hero-stats">
          <div className="stat-item">
            <span className="stat-number">&lt; 30s</span>
            <span className="stat-label">Analyse complète</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">5</span>
            <span className="stat-label">Analyses gratuites / mois</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">0€</span>
            <span className="stat-label">Sans carte bancaire</span>
          </div>
        </div>

        <div className="hero-buttons">
          <Link to="/analyze" className="btn btn-primary btn-hero">
            Analyser un contrat
          </Link>
          <Link to="/signup" className="btn btn-outline btn-hero">
            Créer un compte gratuit
          </Link>
        </div>

        <p className="hero-tagline">Conçu pour ceux qui signent sans avocat — freelances, TPE, particuliers.</p>
      </div>

      <div className="hero-visual">
        <div className="demo-window">
          <div className="demo-header">
            <div className="demo-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="demo-title">TransparAI — Résultat d'analyse</span>
          </div>
          <div className="demo-body">
            <div className="demo-score-row">
              <div className="demo-score-circle">
                <span className="demo-grade">B+</span>
                <span className="demo-grade-label">Équilibré</span>
              </div>
              <div className="demo-meta">
                <p className="demo-summary">Contrat globalement équilibré. Attention à la clause de résiliation automatique (art. 12) et à la cession de droits d'utilisation des données (art. 8).</p>
              </div>
            </div>
            <div className="demo-clauses">
              <div className="demo-clause risk">Clause de résiliation unilatérale sans préavis</div>
              <div className="demo-clause risk">Cession de données à des tiers non nommés</div>
              <div className="demo-clause ok">Droit de rétractation conforme (14 jours)</div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>

    {/* ── What you get ─────────────────────────────────────── */}
    <motion.section className="features-section" {...fadeInUp}>
      <div className="section-inner">
        <h2 className="section-title">Ce que fait TransparAI, concrètement</h2>
        <p className="section-subtitle">Pas de promesses vagues. Voici ce que vous obtenez à chaque analyse.</p>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-number">01</div>
            <h3>Résumé en langage clair</h3>
            <p>L'IA extrait l'essentiel du contrat et le reformule sans jargon. Vous comprenez ce que vous signez en 30 secondes.</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">02</div>
            <h3>Score de transparence A–F</h3>
            <p>Chaque contrat reçoit une note de A (très favorable) à F (problématique), avec le détail des critères évalués.</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">03</div>
            <h3>Détection des clauses à risque</h3>
            <p>Les clauses abusives, les pièges cachés et les engagements excessifs sont mis en évidence et expliqués.</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">04</div>
            <h3>Upload PDF & OCR</h3>
            <p>Déposez un PDF ou une image scannée. L'OCR extrait le texte automatiquement avant l'analyse.</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">05</div>
            <h3>Export PDF du rapport</h3>
            <p>Téléchargez un rapport structuré de votre analyse, prêt à partager ou à archiver.</p>
          </div>
          <div className="feature-card">
            <div className="feature-number">06</div>
            <h3>Historique de vos analyses</h3>
            <p>Retrouvez toutes vos analyses passées depuis votre tableau de bord, classées et consultables.</p>
          </div>
        </div>
      </div>
    </motion.section>

    {/* ── How it works ─────────────────────────────────────── */}
    <motion.section className="how-section" {...fadeInUp}>
      <div className="section-inner">
        <h2 className="section-title">Comment ça marche</h2>
        <div className="steps-row">
          <div className="step">
            <div className="step-num">1</div>
            <h4>Collez ou déposez votre document</h4>
            <p>Texte copié-collé, PDF ou image — tous les formats sont acceptés.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">2</div>
            <h4>L'IA analyse en moins de 30s</h4>
            <p>GPT-4o lit le contrat, identifie les clauses critiques et génère le rapport.</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-num">3</div>
            <h4>Lisez, décidez, exportez</h4>
            <p>Score, résumé, clauses à risque. Exportez en PDF si besoin.</p>
          </div>
        </div>
      </div>
    </motion.section>

    {/* ── Pricing ──────────────────────────────────────────── */}
    <motion.div id="pricing" {...fadeInUp}>
      <Pricing />
    </motion.div>

    {/* ── Trust ────────────────────────────────────────────── */}
    <motion.section className="trust-section" {...fadeInUp}>
      <div className="section-inner trust-inner">
        <div className="trust-item">
          <strong>Données hébergées en UE</strong>
          <span>Microsoft Azure — région Europe Ouest</span>
        </div>
        <div className="trust-divider" />
        <div className="trust-item">
          <strong>Conforme RGPD</strong>
          <span>Vos documents ne servent pas à entraîner l'IA</span>
        </div>
        <div className="trust-divider" />
        <div className="trust-item">
          <strong>Avis IA, pas juridique</strong>
          <span>TransparAI assiste, il ne remplace pas un avocat</span>
        </div>
      </div>
    </motion.section>

    <motion.div {...fadeInUp}>
      <Footer />
    </motion.div>
  </div>
);

export default LandingPage;
