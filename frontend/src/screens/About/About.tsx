import React from 'react';
import { Link } from 'react-router-dom';
import './About.css';

const About: React.FC = () => {
  return (
    <div className="about-container">
      <header className="about-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>À Propos de TransparAI</h1>
          <p className="subtitle">Révolutionner l'analyse contractuelle grâce à l'intelligence artificielle</p>
        </div>
      </header>

      <main className="about-content">
        <div className="container">
          {/* Mission Section */}
          <section className="mission-section">
            <div className="content-block">
              <h2>🎯 Notre Mission</h2>
              <p className="lead">
                Rendre les conditions générales d'utilisation transparentes et compréhensibles pour tous. 
                Chez TransparAI, nous croyons que chacun devrait pouvoir comprendre les implications 
                légales des services qu'il utilise.
              </p>
              <p>
                Dans un monde où les contrats numériques deviennent de plus en plus complexes, nous utilisons 
                l'intelligence artificielle pour démocratiser l'accès à l'information juridique et protéger 
                les droits des consommateurs et des entreprises.
              </p>
            </div>
          </section>

          {/* Problem & Solution */}
          <section className="problem-solution">
            <div className="two-column">
              <div className="problem-block">
                <h3>😤 Le Problème</h3>
                <ul>
                  <li>📄 <strong>Complexité juridique :</strong> Des conditions de 50+ pages en jargon légal</li>
                  <li>⏰ <strong>Manque de temps :</strong> Qui lit vraiment les CGU avant d'accepter ?</li>
                  <li>💰 <strong>Coûts élevés :</strong> Consulter un avocat pour chaque contrat</li>
                  <li>⚖️ <strong>Déséquilibre :</strong> Clauses abusives cachées dans le texte</li>
                  <li>🌍 <strong>Évolution constante :</strong> Modifications fréquentes non signalées</li>
                </ul>
              </div>
              <div className="solution-block">
                <h3>✨ Notre Solution</h3>
                <ul>
                  <li>🤖 <strong>IA spécialisée :</strong> Analyse automatisée en 30 secondes</li>
                  <li>📊 <strong>Score de transparence :</strong> Évaluation objective sur 100</li>
                  <li>🎯 <strong>Points d'attention :</strong> Identification des clauses importantes</li>
                  <li>📋 <strong>Résumé clair :</strong> Langage simple et compréhensible</li>
                  <li>⚡ <strong>Comparaison :</strong> Analysez plusieurs offres simultanément</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="how-it-works">
            <h2>🔬 Comment Ça Marche</h2>
            <div className="process-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>📤 Upload</h4>
                  <p>Téléchargez votre document PDF ou collez le texte des conditions générales</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>🧠 Analyse IA</h4>
                  <p>Notre intelligence artificielle examine 50+ critères de transparence et d'équité</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>📊 Score</h4>
                  <p>Obtenez un score de transparence de 0 à 100 avec explication détaillée</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>📋 Rapport</h4>
                  <p>Recevez un résumé clair avec points d'attention et recommandations</p>
                </div>
              </div>
            </div>
          </section>

          {/* Technology */}
          <section className="technology-section">
            <h2>⚙️ Notre Technologie</h2>
            <div className="tech-grid">
              <div className="tech-item">
                <h4>🤖 Intelligence Artificielle</h4>
                <p>Modèles avancés GPT-4 et Gemini spécialement entraînés sur les textes juridiques français et européens</p>
              </div>
              <div className="tech-item">
                <h4>📚 Base de Connaissances</h4>
                <p>Modèles entraînés sur des corpus juridiques publics conformes aux standards RGPD</p>
              </div>
              <div className="tech-item">
                <h4>🔍 Analyse Sémantique</h4>
                <p>Compréhension contextuelle des clauses, détection des ambiguïtés et des déséquilibres</p>
              </div>
              <div className="tech-item">
                <h4>📊 Scoring Algorithmique</h4>
                <p>Système de notation intelligent basé sur des critères de transparence et d'équité</p>
              </div>
              <div className="tech-item">
                <h4>🔐 Sécurité Avancée</h4>
                <p>Chiffrement bout-en-bout, suppression automatique, conformité RGPD intégrale</p>
              </div>
              <div className="tech-item">
                <h4>⚡ Performance</h4>
                <p>Infrastructure cloud moderne pour des analyses rapides et fiables</p>
              </div>
            </div>
          </section>

          {/* Values */}
          <section className="values-section">
            <h2>💎 Nos Valeurs</h2>
            <div className="values-grid">
              <div className="value-item">
                <span className="value-icon">🔍</span>
                <h4>Transparence</h4>
                <p>Nous croyons en la transparence totale. Notre propre fonctionnement est documenté et nos analyses sont explicables.</p>
              </div>
              <div className="value-item">
                <span className="value-icon">🤝</span>
                <h4>Accessibilité</h4>
                <p>L'information juridique doit être accessible à tous, pas seulement aux experts. Nous démocratisons le droit.</p>
              </div>
              <div className="value-item">
                <span className="value-icon">🛡️</span>
                <h4>Protection</h4>
                <p>Votre confidentialité est sacrée. Nous protégeons vos données avec les plus hauts standards de sécurité.</p>
              </div>
              <div className="value-item">
                <span className="value-icon">🎯</span>
                <h4>Précision</h4>
                <p>Nous visons l'excellence technique avec une IA constamment améliorée et validée par des juristes.</p>
              </div>
              <div className="value-item">
                <span className="value-icon">🌍</span>
                <h4>Impact</h4>
                <p>Nous voulons créer un écosystème numérique plus équitable où les droits des utilisateurs sont respectés.</p>
              </div>
              <div className="value-item">
                <span className="value-icon">🚀</span>
                <h4>Innovation</h4>
                <p>Nous repoussons les limites de ce qui est possible avec l'IA appliquée au domaine juridique.</p>
              </div>
            </div>
          </section>

          {/* Team */}
          <section className="team-section">
            <h2>🚀 Le Projet</h2>
            <div className="team-content">
              <p className="team-intro">
                TransparAI est un projet innovant qui utilise l'intelligence artificielle pour rendre 
                les conditions générales plus transparentes et compréhensibles. Notre mission est de 
                démocratiser l'accès à l'information juridique.
              </p>
              <div className="team-stats">
                <div className="stat">
                  <span className="stat-number">🆕</span>
                  <span className="stat-label">Projet en développement</span>
                </div>
                <div className="stat">
                  <span className="stat-number">🎯</span>
                  <span className="stat-label">Focus transparence</span>
                </div>
                <div className="stat">
                  <span className="stat-number">🔬</span>
                  <span className="stat-label">IA avancée</span>
                </div>
                <div className="stat">
                  <span className="stat-number">🌍</span>
                  <span className="stat-label">Vision européenne</span>
                </div>
              </div>
            </div>
          </section>

          {/* Vision */}
          <section className="vision-section">
            <h2>🔮 Notre Vision</h2>
            <div className="vision-content">
              <p className="vision-text">
                <strong>Notre objectif : rendre les conditions générales transparentes et accessibles à tous.</strong>
              </p>
              <p>
                Imaginez un monde où accepter des conditions générales ne soit plus un acte de foi aveugle, 
                mais une décision éclairée. Où chacun peut comprendre facilement les implications 
                des services qu'il utilise grâce à l'intelligence artificielle.
              </p>
              <div className="future-goals">
                <div className="goal">
                  <h4>🌐 Amélioration Continue</h4>
                  <p>Perfectionnement des algorithmes d'analyse et ajout de nouvelles fonctionnalités</p>
                </div>
                <div className="goal">
                  <h4>🔗 Accessibilité</h4>
                  <p>Développement d'outils pour rendre l'analyse accessible au plus grand nombre</p>
                </div>
                <div className="goal">
                  <h4>🏛️ Transparence</h4>
                  <p>Promotion de la transparence contractuelle dans l'écosystème numérique</p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="cta-section">
            <div className="cta-card">
              <h3>🚀 Rejoignez la Révolution de la Transparence</h3>
              <p>
                Prêt à prendre le contrôle de vos contrats numériques ? 
                Commencez dès aujourd'hui avec 20 analyses gratuites.
              </p>
              <div className="cta-actions">
                <Link to="/signup" className="btn btn-primary">
                  🎯 Créer un Compte
                </Link>
                <Link to="/analyze" className="btn btn-outline">
                  🔍 Essayer l'Analyse
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;