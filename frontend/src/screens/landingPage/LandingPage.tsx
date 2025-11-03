// File: src/screens/landingPage/LandingPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import './LandingPage.css'; // This CSS file will contain the new styles

import Header from '@/components/LandingComponents/Header';
import Features from '@/components/LandingComponents/Features';
import Pricing from '@/components/LandingComponents/Pricing';
import Footer from '@/components/LandingComponents/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  viewport: { once: true, margin: "-100px" } // Optimize for performance
};

const LandingPage: React.FC = () => {
  return (
    <div className="landing-wrapper">
      <Header />

      {/* Hero Section */}
      <motion.section className="hero-section" {...fadeInUp}>
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>Nouveau : Analyse IA Ultra-Rapide</span>
          </div>
          
          <h1 className="hero-title">
            Révolutionnez votre façon d'analyser les <span className="hero-highlight">contrats</span>
          </h1>
          
          <p className="hero-subtitle">
            <strong>TransparAI</strong> transforme vos documents complexes en analyses claires et actionables. 
            Détection intelligente de clauses, scoring automatique et protection contre les pièges contractuels.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">IA</span>
              <span className="stat-label">Analyse intelligente</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">Rapide</span>
              <span className="stat-label">Résultats instantanés</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">&lt; 30s</span>
              <span className="stat-label">Temps d'analyse</span>
            </div>
          </div>

          <div className="hero-buttons">
            <Link to="/analyze" className="btn btn-primary btn-hero">
              <span className="btn-icon">🚀</span>
              Analyser maintenant
            </Link>
            <Link to="/signup" className="btn btn-outline btn-hero">
              <span className="btn-icon">👁️</span>
              Voir la démo
            </Link>
          </div>

          <div className="hero-trust">
            <p className="trust-text">Analysez vos contrats en toute confiance</p>
            <div className="trust-badges">
              <span className="trust-badge">🏢 Entreprises</span>
              <span className="trust-badge">⚖️ Professionnels du droit</span>
              <span className="trust-badge">👥 Particuliers</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-demo-container">
            <div className="demo-window">
              <div className="demo-header">
                <div className="demo-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span className="demo-title">TransparAI - Analyse en cours</span>
              </div>
              <div className="demo-content">
                <div className="analysis-progress">
                  <div className="progress-item active">
                    <span className="progress-icon">📄</span>
                    <span>Document détecté</span>
                    <span className="check">✅</span>
                  </div>
                  <div className="progress-item active">
                    <span className="progress-icon">🧠</span>
                    <span>Analyse IA en cours</span>
                    <div className="loading-bar">
                      <div className="loading-fill"></div>
                    </div>
                  </div>
                  <div className="progress-item">
                    <span className="progress-icon">📊</span>
                    <span>Score de transparence</span>
                    <span className="pending">⏳</span>
                  </div>
                  <div className="progress-item">
                    <span className="progress-icon">⚠️</span>
                    <span>Détection de clauses</span>
                    <span className="pending">⏳</span>
                  </div>
                </div>
                <div className="score-preview">
                  <div className="score-circle">
                    <span className="score-number">A+</span>
                    <span className="score-text">Excellent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.div id="features" {...fadeInUp}>
        <Features />
      </motion.div>

      {/* Enhanced Feature Sections */}
      <motion.section className="feature-hero enhanced-ai-section" {...fadeInUp}>
        <div className="feature-container">
          <div className="feature-icon">⚡</div>
          <h2>Analyse IA Ultra-Précise en <span className="highlight">30 Secondes</span></h2>
          <p className="feature-description">
            Propulsée par <strong>Gemini 2.0 Flash</strong>, notre IA de dernière génération décortique vos contrats plus rapidement qu'un juriste expert. 
          </p>
          
          <div className="enhanced-features-grid">
            <div className="enhanced-feature-item">
              <span className="enhanced-icon">✨</span>
              <strong>Extraction automatique</strong><br />
              des clauses critiques cachées
            </div>
            <div className="enhanced-feature-item">
              <span className="enhanced-icon">🧠</span>
              <strong>Résumé intelligent</strong><br />
              adapté à votre niveau d'expertise
            </div>
            <div className="enhanced-feature-item">
              <span className="enhanced-icon">📊</span>
              <strong>Évaluation complète</strong><br />
              de la transparence et des risques
            </div>
            <div className="enhanced-feature-item">
              <span className="enhanced-icon">⚡</span>
              <strong>Résultats instantanés</strong><br />
              Fini l'attente de jours ou semaines
            </div>
          </div>
          
          <div className="stats-row">
            <div className="stat">
              <span className="number">30s</span>
              <span className="label">Temps d'analyse</span>
            </div>
            <div className="stat">
              <span className="number">IA</span>
              <span className="label">Technologie avancée</span>
            </div>
            <div className="stat">
              <span className="number">50+</span>
              <span className="label">Critères analysés</span>
            </div>
          </div>

          <div className="cta-section">
            <Link to="/analyze" className="btn btn-primary btn-enhanced">
              🚀 Tester l'analyse IA
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section className="scoring-section enhanced-scoring" {...fadeInUp}>
        <div className="feature-container">
          <div className="feature-icon">🎯</div>
          <h2>Scoring Visuel & <span className="highlight">Comparaison Intelligente</span></h2>
          <p className="feature-description">
            Comprenez en un coup d'œil la qualité de vos contrats grâce à notre système de notation révolutionnaire.
          </p>
          
          <div className="scoring-demo">
            <div className="score-card excellent">
              <div className="grade">A+</div>
              <div className="label">Excellent</div>
              <div className="description">Très favorable au consommateur</div>
            </div>
            <div className="score-card good">
              <div className="grade">B</div>
              <div className="label">Bon</div>
              <div className="description">Équilibré avec vigilance</div>
            </div>
            <div className="score-card poor">
              <div className="grade">F</div>
              <div className="label">Problématique</div>
              <div className="description">Clauses potentiellement abusives</div>
            </div>
          </div>

          <div className="enhanced-features-grid">
            <div className="enhanced-feature-item">
              <span className="enhanced-icon">🔍</span>
              <strong>Comparaison Multi-Contrats</strong><br />
              Analysez jusqu'à 5 documents simultanément
            </div>
            <div className="enhanced-feature-item">
              <span className="enhanced-icon">📈</span>
              <strong>Tableaux Comparatifs</strong><br />
              Visualisez les différences critiques instantanément
            </div>
            <div className="enhanced-feature-item">
              <span className="enhanced-icon">🏆</span>
              <strong>Classement Automatique</strong><br />
              Identifiez la meilleure option en un clic
            </div>
          </div>

          <div className="cta-section">
            <Link to="/analyze" className="btn btn-outline btn-enhanced">
              👁️ Voir un exemple de score
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.div id="pricing" {...fadeInUp}>
        <Pricing />
      </motion.div>

      {/* Use Cases & Domains Section */}
      <motion.section className="usecases-section enhanced-usecases" {...fadeInUp}>
        <div className="feature-container">
          <div className="feature-icon">🎯</div>
          <h2>Cas d'Usage & <span className="highlight">Domaines d'Application</span></h2>
          <p className="feature-description">
            TransparAI s'adapte à tous les secteurs et types de contrats. Découvrez comment notre IA révolutionne l'analyse contractuelle.
          </p>

          <div className="usecases-grid">
            <div className="usecase-category">
              <div className="category-header">
                <span className="category-icon">🏢</span>
                <h3>Entreprises & PME</h3>
              </div>
              <div className="usecase-list">
                <div className="usecase-item">
                  <span className="usecase-bullet">📋</span>
                  <div className="usecase-content">
                    <strong>Contrats Fournisseurs</strong>
                    <span className="usecase-description">Négociation, conditions de paiement, clauses de livraison</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">👥</span>
                  <div className="usecase-content">
                    <strong>Contrats de Travail</strong>
                    <span className="usecase-description">CDI, CDD, clauses de non-concurrence, accords d'entreprise</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">🏘️</span>
                  <div className="usecase-content">
                    <strong>Baux Commerciaux</strong>
                    <span className="usecase-description">Conditions locatives, charges, clauses de révision</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">🤝</span>
                  <div className="usecase-content">
                    <strong>Partenariats</strong>
                    <span className="usecase-description">Accords de distribution, franchise, joint-ventures</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="usecase-category">
              <div className="category-header">
                <span className="category-icon">⚖️</span>
                <h3>Cabinets Juridiques</h3>
              </div>
              <div className="usecase-list">
                <div className="usecase-item">
                  <span className="usecase-bullet">📚</span>
                  <div className="usecase-content">
                    <strong>Due Diligence</strong>
                    <span className="usecase-description">Analyse rapide de volumes de contrats, identification des risques</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">⚡</span>
                  <div className="usecase-content">
                    <strong>Pré-analyse Client</strong>
                    <span className="usecase-description">Préparation des dossiers, gain de temps facturable</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">🔍</span>
                  <div className="usecase-content">
                    <strong>Audit Contractuel</strong>
                    <span className="usecase-description">Conformité réglementaire, clauses non-conformes</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">📊</span>
                  <div className="usecase-content">
                    <strong>Rapports Clients</strong>
                    <span className="usecase-description">Synthèses automatisées, recommandations personnalisées</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="usecase-category">
              <div className="category-header">
                <span className="category-icon">🏠</span>
                <h3>Particuliers</h3>
              </div>
              <div className="usecase-list">
                <div className="usecase-item">
                  <span className="usecase-bullet">🏡</span>
                  <div className="usecase-content">
                    <strong>Immobilier</strong>
                    <span className="usecase-description">Achat, vente, location, syndic de copropriété</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">🛡️</span>
                  <div className="usecase-content">
                    <strong>Assurances</strong>
                    <span className="usecase-description">Polices d'assurance, exclusions, franchises cachées</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">💳</span>
                  <div className="usecase-content">
                    <strong>Services Financiers</strong>
                    <span className="usecase-description">Prêts, crédits, investissements, conditions bancaires</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">📱</span>
                  <div className="usecase-content">
                    <strong>Numérique</strong>
                    <span className="usecase-description">CGU des plateformes, confidentialité des données</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="usecase-category">
              <div className="category-header">
                <span className="category-icon">🏭</span>
                <h3>Secteurs Spécialisés</h3>
              </div>
              <div className="usecase-list">
                <div className="usecase-item">
                  <span className="usecase-bullet">🏥</span>
                  <div className="usecase-content">
                    <strong>Santé</strong>
                    <span className="usecase-description">Contrats médicaux, recherche clinique, partenariats hospitaliers</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">🎓</span>
                  <div className="usecase-content">
                    <strong>Éducation</strong>
                    <span className="usecase-description">Conventions université-entreprise, contrats étudiants</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">🌱</span>
                  <div className="usecase-content">
                    <strong>Énergie & Environnement</strong>
                    <span className="usecase-description">Contrats verts, compensation carbone, énergies renouvelables</span>
                  </div>
                </div>
                <div className="usecase-item">
                  <span className="usecase-bullet">🚀</span>
                  <div className="usecase-content">
                    <strong>Technologies</strong>
                    <span className="usecase-description">Licences logicielles, SaaS, propriété intellectuelle</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="cta-section">
            <Link to="/analyze" className="btn btn-primary btn-enhanced">
              🎯 Analyser votre contrat
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Enterprise AI Workflow Section */}
      <motion.section className="enterprise-section enhanced-enterprise" {...fadeInUp}>
        <div className="feature-container">
          <div className="feature-icon">🤖</div>
          <h2>Solutions <span className="highlight">IA Personnalisées</span> pour Entreprises</h2>
          <p className="feature-description">
            Vous êtes une grande entreprise ? Nous créons des workflows IA sur-mesure, 
            des agents autonomes et des intégrations complètes avec vos outils existants.
          </p>

          <div className="enterprise-grid">
            <div className="enterprise-service">
              <div className="service-icon">⚙️</div>
              <h3>Workflows IA Personnalisés</h3>
              <p>Automatisation complète de vos processus contractuels, de la création à la signature</p>
              <ul className="service-features">
                <li>✅ Analyse automatique des clauses critiques</li>
                <li>✅ Validation multi-niveaux personnalisée</li>
                <li>✅ Alertes et notifications automatiques</li>
                <li>✅ Rapports exécutifs en temps réel</li>
              </ul>
            </div>

            <div className="enterprise-service">
              <div className="service-icon">🔗</div>
              <h3>Intégrations Systèmes</h3>
              <p>Connexion transparente avec vos outils juridiques, CRM, ERP et plateformes existantes</p>
              <ul className="service-features">
                <li>✅ API native pour vos systèmes</li>
                <li>✅ Connecteurs SAP, Salesforce, etc.</li>
                <li>✅ Synchronisation bidirectionnelle</li>
                <li>✅ SSO et gestion des droits</li>
              </ul>
            </div>

            <div className="enterprise-service">
              <div className="service-icon">🧠</div>
              <h3>Agents IA Autonomes</h3>
              <p>Des assistants IA spécialisés qui apprennent vos processus et prennent des décisions autonomes</p>
              <ul className="service-features">
                <li>✅ Agent de négociation automatique</li>
                <li>✅ Détection proactive des risques</li>
                <li>✅ Recommandations stratégiques</li>
                <li>✅ Apprentissage continu de vos données</li>
              </ul>
            </div>

            <div className="enterprise-service">
              <div className="service-icon">📊</div>
              <h3>Analytics & BI Avancés</h3>
              <p>Tableaux de bord intelligents et analyses prédictives pour optimiser vos contrats</p>
              <ul className="service-features">
                <li>✅ KPIs contractuels en temps réel</li>
                <li>✅ Prédiction des risques futurs</li>
                <li>✅ Benchmarking sectoriel</li>
                <li>✅ ROI et optimisation des coûts</li>
              </ul>
            </div>
          </div>

          <div className="enterprise-benefits">
            <h3>🚀 Transformez votre service juridique en avantage concurrentiel</h3>
            <div className="benefits-grid">
              <div className="benefit-item">
                <span className="benefit-icon">⚡</span>
                <div className="benefit-content">
                  <strong>90% de gain de temps</strong>
                  <span className="benefit-description">Automatisation des tâches répétitives</span>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🎯</span>
                <div className="benefit-content">
                  <strong>Zéro erreur humaine</strong>
                  <span className="benefit-description">Détection systématique des problèmes</span>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">💰</span>
                <div className="benefit-content">
                  <strong>ROI prouvé en 3 mois</strong>
                  <span className="benefit-description">Réduction des coûts juridiques</span>
                </div>
              </div>
              <div className="benefit-item">
                <span className="benefit-icon">🔒</span>
                <div className="benefit-content">
                  <strong>Conformité garantie</strong>
                  <span className="benefit-description">Respect automatique des réglementations</span>
                </div>
              </div>
            </div>
          </div>

          <div className="enterprise-cta">
            <div className="cta-content">
              <h3>💼 Prêt à révolutionner votre gestion contractuelle ?</h3>
              <p>Nos experts vous accompagnent dans la conception et la mise en place de votre solution IA sur-mesure.</p>
              <div className="cta-buttons">
                <Link to="/signup" className="btn btn-primary btn-enhanced">
                  📞 Planifier une démo
                </Link>
                <Link to="/signup" className="btn btn-outline btn-enhanced">
                  📧 Nous contacter
                </Link>
              </div>
            </div>
            <div className="cta-contact">
              <div className="contact-item">
                <span className="contact-icon">⏱️</span>
                <div className="contact-content">
                  <strong>Démo personnalisée</strong>
                  <span className="contact-description">45 minutes avec vos cas d'usage</span>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🎯</span>
                <div className="contact-content">
                  <strong>POC gratuit</strong>
                  <span className="contact-description">Test sur vos vrais contrats</span>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🚀</span>
                <div className="contact-content">
                  <strong>Déploiement rapide</strong>
                  <span className="contact-description">Mise en production en 4 semaines</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced Security Section */}
      <motion.section className="security-section enhanced-security" {...fadeInUp}>
        <div className="feature-container">
          <div className="feature-icon">🛡️</div>
          <h2>Sécurité <span className="highlight">Niveau Bancaire</span> & Protection Avancée</h2>
          <p className="feature-description">
            Vos documents sensibles méritent la protection la plus élevée. 
            TransparAI respecte les standards de sécurité les plus stricts.
          </p>

          <div className="security-grid">
            <div className="security-item">
              <div className="security-icon">🔐</div>
              <h3>Chiffrement Sécurisé</h3>
              <p>Protection avancée de vos données personnelles et contractuelles</p>
            </div>
            
            <div className="security-item">
              <div className="security-icon">⚠️</div>
              <h3>Analyse de Clauses</h3>
              <p>Détection intelligente des clauses potentiellement problématiques</p>
            </div>
            
            <div className="security-item">
              <div className="security-icon">🚨</div>
              <h3>Alertes Temps Réel</h3>
              <p>Notification immédiate des risques et clauses suspectes</p>
            </div>
            
            <div className="security-item">
              <div className="security-icon">🇪🇺</div>
              <h3>Conformité RGPD</h3>
              <p>Respect total des réglementations européennes de protection des données</p>
            </div>
            
            <div className="security-item">
              <div className="security-icon">🗑️</div>
              <h3>Gestion Sécurisée</h3>
              <p>Vos documents sont traités de manière sécurisée et confidentielle</p>
            </div>
            
            <div className="security-item">
              <div className="security-icon">🏛️</div>
              <h3>Hébergement Sécurisé</h3>
              <p>Infrastructure cloud sécurisée avec sauvegarde des données</p>
            </div>
          </div>

          <div className="trust-badges">
            <div className="badge">🔒 Sécurité Renforcée</div>
            <div className="badge">🇪🇺 RGPD Ready</div>
            <div className="badge">🔐 Données Chiffrées</div>
          </div>

          <div className="cta-section">
            <Link to="/signup" className="btn btn-outline btn-enhanced">
              🛡️ Découvrir la sécurité
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.div {...fadeInUp}>
        <Footer />
      </motion.div>
    </div>
  );
};

export default LandingPage;
