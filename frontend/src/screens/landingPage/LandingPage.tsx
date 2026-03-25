import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import './LandingPage.css';

import Header from '@/components/LandingComponents/Header';
import Pricing from '@/components/LandingComponents/Pricing';
import Footer from '@/components/LandingComponents/Footer';

/* ─── Animation presets ─────────────────────────────────────────────────── */
const reveal = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  viewport: { once: true, margin: '-60px' },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: i * 0.09 },
  viewport: { once: true, margin: '-40px' },
});

const heroLeft = {
  initial: { opacity: 0, x: -24 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
};

const heroRight = {
  initial: { opacity: 0, x: 32, rotate: -2 },
  animate: { opacity: 1, x: 0, rotate: -1 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.25 },
};

/* ─── Feature data ──────────────────────────────────────────────────────── */
const FEATURES = [
  {
    n: '01',
    title: 'Résumé en langage clair',
    body: "L'IA extrait l'essentiel et le reformule sans jargon juridique. Vous comprenez ce que vous signez en moins d'une minute.",
  },
  {
    n: '02',
    title: 'Score de transparence A–F',
    body: 'Chaque contrat reçoit une note de A (très favorable) à F (abusif), avec le détail des critères évalués.',
  },
  {
    n: '03',
    title: 'Détection des clauses à risque',
    body: 'Les clauses abusives, engagements excessifs et pièges contractuels sont identifiés, annotés et expliqués.',
  },
  {
    n: '04',
    title: 'Upload PDF & OCR intégré',
    body: "Déposez un PDF natif ou un scan papier. L'OCR embarqué extrait le texte automatiquement avant analyse.",
  },
  {
    n: '05',
    title: 'Rapport exportable en PDF',
    body: 'Téléchargez un rapport structuré, prêt à partager avec votre équipe juridique ou à archiver.',
  },
  {
    n: '06',
    title: 'Historique & suivi',
    body: "Retrouvez toutes vos analyses depuis votre tableau de bord. Comparez l'évolution d'un contrat dans le temps.",
  },
];

const TRUST = [
  { label: 'Hébergement UE', sub: 'Microsoft Azure — Europe Ouest' },
  { label: 'Conforme RGPD', sub: 'Vos documents ne servent jamais à entraîner l\'IA' },
  { label: 'Chiffrement bout-en-bout', sub: 'AES-256 au repos, TLS 1.3 en transit' },
  { label: 'Avis IA · pas juridique', sub: 'TransparAI assiste, ne remplace pas un avocat' },
];

/* ─── Component ─────────────────────────────────────────────────────────── */
const LandingPage: React.FC = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  useInView(statsRef, { once: true, margin: '-80px' });

  return (
    <div className="lp-root">
      <Header />

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="lp-hero">
        <div className="lp-hero-grid" aria-hidden />

        <motion.div className="lp-hero-left" {...heroLeft}>
          <motion.div
            className="lp-eu-badge"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            🇪🇺&nbsp;&nbsp;Données hébergées en UE · Conforme RGPD
          </motion.div>

          <h1 className="lp-hero-h1">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ display: 'block' }}
            >
              Vous signez
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.32 }}
              style={{ display: 'block' }}
            >
              <strong>sans avocat ?</strong>
            </motion.span>
            <motion.em
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.44 }}
            >
              Lisez ce que vous acceptez.
            </motion.em>
          </h1>

          <motion.p
            className="lp-hero-sub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.55 }}
          >
            TransparAI analyse vos contrats, CGU et CGV grâce à Azure OpenAI GPT-4o —
            résumé en langage clair, score de transparence A–F, et détection des clauses à risque.
          </motion.p>

          <motion.div
            className="lp-hero-stats"
            ref={statsRef}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.65 }}
          >
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
          </motion.div>

          <motion.div
            className="lp-hero-cta"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75 }}
          >
            <Link to="/analyze" className="lp-btn-primary">
              Analyser un contrat →
            </Link>
            <Link to="/signup" className="lp-btn-ghost">
              Compte gratuit
            </Link>
          </motion.div>

          <motion.p
            className="lp-hero-note"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9 }}
          >
            Pour les freelances, TPE, startups et particuliers qui signent sans avocat.
          </motion.p>
        </motion.div>

        {/* Demo card with scanner beam */}
        <motion.div {...heroRight}>
          <div className="lp-scanner-wrap">
            <div className="lp-scanner-bracket" aria-hidden />
            <div className="lp-scanner-bracket-bl" aria-hidden />

            <div className="lp-demo-card">
              <div className="lp-demo-topbar">
                <div className="lp-demo-dots">
                  <span /><span /><span />
                </div>
                <span className="lp-demo-title">TransparAI — Analyse en cours</span>
              </div>

              <div className="lp-demo-body">
                {/* Animated scanner beam */}
                <div className="lp-scanner-beam" aria-hidden />

                {/* Contract text excerpt */}
                <div className="lp-contract-preview">
                  Article 12 — Résiliation. Le prestataire se réserve le droit de{' '}
                  <mark>résilier le présent contrat sans préavis</mark> en cas de manquement
                  présumé. Article 8 — Données personnelles.{' '}
                  <mark>Les données collectées pourront être cédées à des partenaires tiers</mark>{' '}
                  sans notification préalable de l'utilisateur…
                </div>

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
          </div>
        </motion.div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════════════════════════ */}
      <section id="features" className="lp-features">
        <div className="lp-container">
          <motion.div className="lp-section-header" {...reveal}>
            <span className="lp-label">Ce que vous obtenez</span>
            <h2 className="lp-section-h2">
              Concrètement, à chaque <em>analyse</em>
            </h2>
            <p className="lp-section-sub">
              Six résultats structurés produits à chaque analyse — pas de promesses vagues.
            </p>
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
            <p className="lp-section-sub">
              Trois étapes. Moins d'une minute. Aucune installation requise.
            </p>
          </motion.div>

          <div className="lp-steps">
            {[
              {
                n: '01',
                title: 'Collez ou déposez votre document',
                body: 'Texte copié-collé, PDF natif ou image scannée — tous les formats sont acceptés. L\'OCR prend en charge les documents papier numérisés.',
              },
              {
                n: '02',
                title: 'GPT-4o analyse en 30 secondes',
                body: 'Le modèle lit l\'intégralité du contrat, identifie les clauses critiques, calcule le score de transparence et génère le rapport structuré.',
              },
              {
                n: '03',
                title: 'Lisez, comprenez, décidez',
                body: 'Score A–F, résumé en clair, liste des clauses à risque. Exportez le rapport en PDF ou partagez-le avec votre équipe.',
              },
            ].map(({ n, title, body }, i) => (
              <React.Fragment key={n}>
                <motion.div className="lp-step" {...stagger(i)}>
                  <span className="lp-step-n">{n}</span>
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
};

export default LandingPage;
