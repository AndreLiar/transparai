// File: src/screens/landingPage/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css';

import Header from '@/components/LandingComponents/Header';
import Features from '@/components/LandingComponents/Features';
import Pricing from '@/components/LandingComponents/Pricing';
import Footer from '@/components/LandingComponents/Footer';
import FeatureSection from '@/components/LandingComponents/FeatureSection';

import featureAI from '@/assets/cgvdanger.png';
import featureScore from '@/assets/scoring.png';
import featureShield from '@/assets/trust.png';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true }
};

const LandingPage: React.FC = () => {
  return (
    <div className="landing-wrapper">
      <Header />

      {/* Hero Section */}
      <motion.section className="hero-section" {...fadeInUp}>
        <div className="hero-content">
          <h1>L’IA qui éclaire vos CGA</h1>
          <p className="subtitle">Analysez vos conditions d’abonnement avec transparence. Résumés, score, pièges détectés.</p>
          <div className="hero-buttons">
            <Link to="/analyze" className="btn primary">Analyser un CGA</Link>
            <Link to="/signup" className="btn outline">Essayer gratuitement</Link>
          </div>
        </div>
      </motion.section>

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
        <Pricing />
      </motion.div>

      <motion.div {...fadeInUp}>
        <Footer />
      </motion.div>
    </div>
  );
};

export default LandingPage;

