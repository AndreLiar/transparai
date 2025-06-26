// File: src/screens/landingPage/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css'; // This CSS file will contain the new styles

import Header from '@/components/LandingComponents/Header';
import Features from '@/components/LandingComponents/Features';
import Pricing from '@/components/LandingComponents/Pricing';
import Footer from '@/components/LandingComponents/Footer';
import FeatureSection from '@/components/LandingComponents/FeatureSection'; // Make sure this component is styled separately to match the luxury feel

import featureAI from '@/assets/cgvdanger.png';
import featureScore from '@/assets/scoring.png';
import featureShield from '@/assets/trust.png';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }, // Smoother ease for luxury
  viewport: { once: true }
};

const LandingPage: React.FC = () => {
  return (
    <div className="landing-wrapper">
      <Header />

      {/* Hero Section */}
      <motion.section className="hero-section" {...fadeInUp}>
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="hero-highlight">TransparAI</span>: L’IA qui éclaire vos conditions d'abonnement.
          </h1>
          <p className="hero-subtitle">
            Analysez vos contrats avec une clarté inégalée. Obtenez des résumés précis, un score de transparence et une détection proactive des clauses sensibles.
          </p>
          <div className="hero-buttons">
            <Link to="/analyze" className="btn btn-primary btn-hero">Analyser un document</Link>
            <Link to="/signup" className="btn btn-outline btn-hero">Découvrir gratuitement</Link>
          </div>
        </div>
      </motion.section>

      {/* The rest of your sections will follow a similar pattern for motion.div */}
      <motion.div {...fadeInUp}>
        <Features />
      </motion.div>

      <motion.div {...fadeInUp}>
        <FeatureSection
          title="Analyse intelligente de documents"
          description="Grâce à notre IA, les CGA sont scannés, interprétés et résumés automatiquement. Vous obtenez une vue claire des termes importants et des pièges potentiels."
          image={featureAI}
          ctaText="Analyser un CGA"
          ctaLink="/analyze"
          ctaVariant="primary" // Ensure consistent ctaVariant for FeatureSection
        />
      </motion.div>

      <motion.div {...fadeInUp}>
        <FeatureSection
          title="Score de transparence"
          description="Chaque CGA analysé obtient un score de clarté (ex: A+, 95/100) basé sur sa lisibilité, ses clauses critiques, et sa transparence globale."
          image={featureScore}
          reverse
          ctaText="Créer un compte"
          ctaLink="/signup"
          ctaVariant="outline"
        />
      </motion.div>
      <motion.div {...fadeInUp}>
        <Pricing />
      </motion.div>
      <motion.div {...fadeInUp}>
        <FeatureSection
          title="Détection des clauses abusives"
          description="TransparAI vous protège contre les pièges contractuels en mettant en lumière les clauses sensibles grâce à une analyse poussée et visuelle."
          image={featureShield}
          ctaText="Protégez-vous maintenant"
          ctaLink="/signup"
          ctaVariant="outline"
        />
      </motion.div>

      <motion.div {...fadeInUp}>
        <Footer />
      </motion.div>
    </div>
  );
};

export default LandingPage;
