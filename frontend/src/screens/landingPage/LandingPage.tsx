// File: src/screens/landingPage/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

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
    <div className="bg-light text-dark min-vh-100 d-flex flex-column">

      <Header />

      {/* Hero Section */}
      <motion.section
        className="bg-white py-5 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <h1 className="display-5 fw-bold mb-3">L’IA qui éclaire vos CGA</h1>
          <p className="lead">Analysez vos conditions d’abonnement avec transparence. Résumés, score, pièges détectés.</p>
          <div className="d-flex justify-content-center flex-wrap gap-3 mt-4">
            <Link to="/analyze" className="btn btn-primary px-4">Analyser un CGA</Link>
            <Link to="/signup" className="btn btn-outline-secondary px-4">Essayer gratuitement</Link>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.div {...fadeInUp}>
        <Features />
      </motion.div>

      {/* AI Analysis Section */}
      <motion.div {...fadeInUp}>
        <FeatureSection
          title="Analyse intelligente de documents"
          description="Grâce à notre IA, les CGA sont scannés, interprétés et résumés automatiquement. Vous obtenez une vue claire des termes importants et des pièges potentiels."
          image={featureAI}
          ctaText="Analyser un CGA"
          ctaLink="/analyze"
        />
      </motion.div>

      {/* Transparency Score Section */}
      <motion.div {...fadeInUp}>
        <FeatureSection
          title="Score de transparence"
          description="Chaque CGA analysé obtient un score de clarté (ex: A+, 95/100) basé sur sa lisibilité, ses clauses critiques, et sa transparence globale."
          image={featureScore}
          bg="bg-light"
          reverse
          ctaText="Créer un compte"
          ctaLink="/signup"
          ctaVariant="outline-primary"
        />
      </motion.div>

      {/* Clause Detection Section */}
      <motion.div {...fadeInUp}>
        <FeatureSection
          title="Détection des clauses abusives"
          description="TransparAI vous protège contre les pièges contractuels en mettant en lumière les clauses sensibles grâce à une analyse poussée et visuelle."
          image={featureShield}
          ctaText="Protégez-vous maintenant"
          ctaLink="/signup"
          ctaVariant="outline-danger"
        />
      </motion.div>

      {/* Pricing */}
      <motion.div {...fadeInUp}>
        <Pricing />
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        viewport={{ once: true }}
      >
        <Footer />
      </motion.div>
    </div>
  );
};

export default LandingPage;
