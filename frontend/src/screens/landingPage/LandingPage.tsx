import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

import Header from '@/components/LandingComponents/Header';
import Pricing from '@/components/LandingComponents/Pricing';
import Footer from '@/components/LandingComponents/Footer';

/* ─── Animation presets ─────────────────────────────────────────────────── */
const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, margin: '-60px' },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  viewport: { once: true, margin: '-40px' },
});

/* ─── Feature data ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    n: '01',
    title: 'Résumé en langage clair',
    body: "L'IA extrait l'essentiel du contrat et le reformule sans jargon. Vous comprenez ce que vous signez en 30 secondes.",
  },
  {
    n: '02',
    title: 'Score de transparence A–F',
    body: 'Chaque contrat reçoit une note de A (très favorable) à F (problématique), avec le détail des critères évalués.',
  },
  {
    n: '03',
    title: 'Détection des clauses à risque',
    body: 'Les clauses abusives, les pièges cachés et les engagements excessifs sont mis en évidence et expliqués.',
  },
  {
    n: '04',
    title: 'Upload PDF & OCR',
    body: "Déposez un PDF ou une image scannée. L'OCR extrait le texte automatiquement avant l'analyse.",
  },
  {
    n: '05',
    title: 'Export PDF du rapport',
    body: 'Téléchargez un rapport structuré de votre analyse, prêt à partager ou à archiver.',
  },
  {
    n: '06',
    title: 'Historique de vos analyses',
    body: 'Retrouvez toutes vos analyses passées depuis votre tableau de bord, classées et consultables.',
  },
];

const TRUST = [
  { label: 'Données hébergées en UE', sub: 'Microsoft Azure — Europe Ouest' },
  { label: 'Conforme RGPD', sub: "Vos documents ne servent pas à entraîner l'IA" },
  { label: 'Avis IA, pas juridique', sub: "TransparAI assiste, ne remplace pas un avocat" },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
const LandingPage: React.FC = () => (
  <div className="lp-root">
    <Header />

    {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
    <section className="lp-hero">
      {/* background grid lines */}
      <div className="lp-hero-grid" aria-hidden />

      <motion.div className="lp-hero-left" {...reveal}>
        <div className="lp-eu-badge">
          <span>🇪🇺</span>
          <span>Données hébergées en UE · Conforme RGPD</span>
        </div>

        <h1 className="lp-hero-h1">
          Vous signez<br />
          sans avocat ?<br />
          <em>Lisez ce que vous<br />acceptez.</em>
        </h1>

        <p className="lp-hero-sub">
          TransparAI analyse vos contrats, CGU et CGV en moins de 30 secondes —
          résumé clair, score de transparence, clauses à risque.
        </p>

        <div className="lp-hero-stats">
          {[
            { v: '< 30s', l: 'Analyse complète' },
            { v: '5', l: 'Analyses gratuites / mois' },
            { v: '0€', l: 'Sans carte bancaire' },
          ].map(({ v, l }) => (
            <div className="lp-stat" key={l}>
              <span className="lp-stat-v">{v}</span>
              <span className="lp-stat-l">{l}</span>
            </div>
          ))}
        </div>

        <div className="lp-hero-cta">
          <Link to="/analyze" className="lp-btn-primary">Analyser un contrat</Link>
          <Link to="/signup" className="lp-btn-ghost">Compte gratuit</Link>
        </div>

        <p className="lp-hero-note">
          Pour les freelances, TPE et particuliers qui signent sans avocat.
        </p>
      </motion.div>

      <motion.div
        className="lp-hero-right"
        initial={{ opacity: 0, x: 32 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        {/* Demo card */}
        <div className="lp-demo-card">
          <div className="lp-demo-topbar">
            <div className="lp-demo-dots">
              <span /><span /><span />
            </div>
            <span className="lp-demo-title">TransparAI — Résultat d'analyse</span>
          </div>

          <div className="lp-demo-body">
            <div className="lp-demo-score-row">
              <div className="lp-demo-score">
                <span className="lp-demo-grade">B+</span>
                <span className="lp-demo-grade-sub">Équilibré</span>
              </div>
              <p className="lp-demo-summary">
                Contrat globalement équilibré. Attention à la clause de résiliation
                automatique (art.&nbsp;12) et à la cession de données (art.&nbsp;8).
              </p>
            </div>

            <div className="lp-demo-divider" />

            <ul className="lp-demo-clauses">
              <li className="lp-clause lp-clause--risk">
                <span className="lp-clause-dot" />
                Résiliation unilatérale sans préavis
              </li>
              <li className="lp-clause lp-clause--risk">
                <span className="lp-clause-dot" />
                Cession de données à des tiers non nommés
              </li>
              <li className="lp-clause lp-clause--ok">
                <span className="lp-clause-dot" />
                Droit de rétractation conforme (14 jours)
              </li>
            </ul>

            <div className="lp-demo-footer">
              <span className="lp-demo-model">Azure OpenAI GPT-4o</span>
              <span className="lp-demo-time">analysé en 24s</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>

    {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
    <section className="lp-features">
      <div className="lp-container">
        <motion.div className="lp-section-header" {...reveal}>
          <span className="lp-label">Ce que vous obtenez</span>
          <h2 className="lp-section-h2">Concrètement, à chaque analyse</h2>
          <p className="lp-section-sub">Pas de promesses vagues — voici les six résultats produits à chaque analyse.</p>
        </motion.div>

        <div className="lp-features-grid">
          {FEATURES.map(({ n, title, body }, i) => (
            <motion.div className="lp-feature-card" key={n} {...stagger(i)}>
              <span className="lp-feature-n">{n}</span>
              <h3 className="lp-feature-h3">{title}</h3>
              <p className="lp-feature-p">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>

    {/* ══ HOW IT WORKS ══════════════════════════════════════════════════════ */}
    <section className="lp-how">
      <div className="lp-container">
        <motion.div className="lp-section-header" {...reveal}>
          <span className="lp-label">Processus</span>
          <h2 className="lp-section-h2">Comment ça marche</h2>
        </motion.div>

        <div className="lp-steps">
          {[
            {
              n: '1',
              title: 'Collez ou déposez',
              body: 'Texte copié-collé, PDF ou image scannée — tous les formats sont acceptés.',
            },
            {
              n: '2',
              title: "L'IA analyse en 30s",
              body: 'GPT-4o lit le contrat, identifie les clauses critiques et génère le rapport.',
            },
            {
              n: '3',
              title: 'Lisez et décidez',
              body: 'Score, résumé, clauses à risque. Exportez en PDF si besoin.',
            },
          ].map(({ n, title, body }, i) => (
            <React.Fragment key={n}>
              <motion.div className="lp-step" {...stagger(i)}>
                <div className="lp-step-n">{n}</div>
                <h4 className="lp-step-h4">{title}</h4>
                <p className="lp-step-p">{body}</p>
              </motion.div>
              {i < 2 && <div className="lp-step-connector" aria-hidden />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>

    {/* ══ PRICING ═══════════════════════════════════════════════════════════ */}
    <motion.div id="pricing" {...reveal}>
      <Pricing />
    </motion.div>

    {/* ══ TRUST BAR ═════════════════════════════════════════════════════════ */}
    <motion.section className="lp-trust" {...reveal}>
      <div className="lp-trust-inner">
        {TRUST.map(({ label, sub }, i) => (
          <React.Fragment key={label}>
            <div className="lp-trust-item">
              <strong>{label}</strong>
              <span>{sub}</span>
            </div>
            {i < TRUST.length - 1 && <div className="lp-trust-sep" aria-hidden />}
          </React.Fragment>
        ))}
      </div>
    </motion.section>

    <Footer />
  </div>
);

export default LandingPage;
