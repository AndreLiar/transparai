import React from 'react';
import { Link } from 'react-router-dom';
import './Security.css';

const Security: React.FC = () => {
  return (
    <div className="security-container">
      <header className="security-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>🔐 Sécurité & Confidentialité</h1>
          <p className="subtitle">Votre confiance est notre priorité absolue</p>
        </div>
      </header>

      <main className="security-content">
        <div className="container">
          {/* Security Overview */}
          <section className="security-overview">
            <div className="overview-card">
              <h2>🛡️ Engagement de Sécurité</h2>
              <p className="lead">
                Chez TransparAI, la protection de vos données n'est pas une option, c'est notre fondement. 
                Nous appliquons les plus hauts standards de sécurité de l'industrie pour garantir la 
                confidentialité et l'intégrité de vos informations.
              </p>
              <div className="security-badges">
                <div className="badge">
                  <span className="badge-icon">🇪🇺</span>
                  <span className="badge-text">Conformité RGPD</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">🔒</span>
                  <span className="badge-text">Chiffrement AES-256</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">🛡️</span>
                  <span className="badge-text">Sécurité Renforcée</span>
                </div>
                <div className="badge">
                  <span className="badge-icon">⚡</span>
                  <span className="badge-text">Haute Disponibilité</span>
                </div>
              </div>
            </div>
          </section>

          {/* Data Protection */}
          <section className="data-protection">
            <h2>🗂️ Protection des Données</h2>
            <div className="protection-grid">
              <div className="protection-item">
                <div className="protection-icon">🔐</div>
                <h4>Chiffrement Bout-en-Bout</h4>
                <p>
                  Tous vos documents sont chiffrés avec AES-256 dès le téléchargement. 
                  Les données en transit utilisent TLS 1.3 et celles au repos sont stockées 
                  dans des environnements sécurisés avec chiffrement matériel.
                </p>
              </div>
              <div className="protection-item">
                <div className="protection-icon">🗑️</div>
                <h4>Suppression Automatique</h4>
                <p>
                  Vos documents originaux sont automatiquement supprimés de nos serveurs 
                  dans les 24 heures suivant l'analyse. Seuls les résultats d'analyse 
                  (score, résumé) sont conservés pour votre historique.
                </p>
              </div>
              <div className="protection-item">
                <div className="protection-icon">🏠</div>
                <h4>Hébergement Européen</h4>
                <p>
                  Toutes nos données sont hébergées exclusivement en Europe (centres de données 
                  certifiés ISO 27001) pour garantir la conformité RGPD et éviter les 
                  transferts internationaux non autorisés.
                </p>
              </div>
              <div className="protection-item">
                <div className="protection-icon">👁️</div>
                <h4>Accès Zéro-Trust</h4>
                <p>
                  Même notre équipe technique ne peut pas accéder au contenu de vos documents. 
                  Nos systèmes d'IA traitent les données de manière automatisée sans 
                  intervention humaine.
                </p>
              </div>
              <div className="protection-item">
                <div className="protection-icon">📊</div>
                <h4>Anonymisation Avancée</h4>
                <p>
                  Les données utilisées pour améliorer notre IA sont complètement anonymisées 
                  et agrégées. Aucune information personnelle ou d'entreprise n'est utilisée 
                  pour l'entraînement.
                </p>
              </div>
              <div className="protection-item">
                <div className="protection-icon">🚨</div>
                <h4>Surveillance 24/7</h4>
                <p>
                  Nos systèmes de sécurité surveillent en continu les accès et détectent 
                  automatiquement toute activité suspecte. Alertes immédiates en cas 
                  d'incident potentiel.
                </p>
              </div>
            </div>
          </section>

          {/* Technical Security */}
          <section className="technical-security">
            <h2>⚙️ Sécurité Technique</h2>
            <div className="security-layers">
              <div className="layer">
                <h4>🌐 Réseau & Infrastructure</h4>
                <ul>
                  <li>Firewalls multi-niveaux avec règles strictes</li>
                  <li>Protection DDoS avec filtrage intelligent</li>
                  <li>CDN global pour performance et sécurité</li>
                  <li>Isolation des environnements (dev/staging/prod)</li>
                  <li>Sauvegarde automatique tri-redondante</li>
                </ul>
              </div>
              <div className="layer">
                <h4>🔐 Authentification & Accès</h4>
                <ul>
                  <li>Authentification multi-facteurs (2FA) obligatoire</li>
                  <li>Gestion des sessions avec expiration automatique</li>
                  <li>Tokens JWT sécurisés avec rotation</li>
                  <li>Contrôle d'accès basé sur les rôles (RBAC)</li>
                  <li>Audit complet des connexions et actions</li>
                </ul>
              </div>
              <div className="layer">
                <h4>🛡️ Protection Applicative</h4>
                <ul>
                  <li>Validation stricte de tous les inputs</li>
                  <li>Protection OWASP Top 10 intégrée</li>
                  <li>Sanitisation automatique des documents</li>
                  <li>Rate limiting intelligent par utilisateur</li>
                  <li>Monitoring en temps réel des performances</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Compliance */}
          <section className="compliance-section">
            <h2>📋 Conformité Réglementaire</h2>
            <div className="compliance-grid">
              <div className="compliance-item rgpd">
                <h4>🇪🇺 Conformité RGPD</h4>
                <div className="compliance-details">
                  <div className="detail">
                    <strong>Finalité :</strong> Traitement uniquement pour l'analyse contractuelle
                  </div>
                  <div className="detail">
                    <strong>Base légale :</strong> Consentement explicite et intérêt légitime
                  </div>
                  <div className="detail">
                    <strong>Droits :</strong> Accès, rectification, suppression, portabilité garantis
                  </div>
                  <div className="detail">
                    <strong>DPO :</strong> Délégué à la protection des données désigné
                  </div>
                  <div className="detail">
                    <strong>Rétention :</strong> 3 ans maximum pour les données personnelles
                  </div>
                </div>
              </div>
              <div className="compliance-item iso">
                <h4>🏆 Standards de Sécurité</h4>
                <div className="compliance-details">
                  <div className="detail">
                    <strong>Standards de sécurité :</strong> Application des meilleures pratiques industrielles
                  </div>
                  <div className="detail">
                    <strong>Contrôles de sécurité :</strong> Implémentation des standards de sécurité cloud
                  </div>
                  <div className="detail">
                    <strong>Protection des données :</strong> Respect des principes de protection dans le cloud
                  </div>
                  <div className="detail">
                    <strong>Audits :</strong> Révisions régulières des mesures de sécurité
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Incident Response */}
          <section className="incident-response">
            <h2>🚨 Gestion des Incidents</h2>
            <div className="response-plan">
              <div className="response-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h4>Détection Automatique</h4>
                  <p>Nos systèmes détectent automatiquement les anomalies et incidents de sécurité en temps réel.</p>
                </div>
              </div>
              <div className="response-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h4>Évaluation & Confinement</h4>
                  <p>Évaluation immédiate de l'impact et isolation des systèmes affectés rapidement.</p>
                </div>
              </div>
              <div className="response-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h4>Notification</h4>
                  <p>Information des utilisateurs concernés dans les 72h conformément aux exigences RGPD.</p>
                </div>
              </div>
              <div className="response-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h4>Résolution & Amélioration</h4>
                  <p>Correction des vulnérabilités et amélioration des mesures de sécurité pour éviter la récurrence.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Security Audits */}
          <section className="security-audits">
            <h2>🔍 Audits & Tests</h2>
            <div className="audit-grid">
              <div className="audit-item">
                <h4>Tests de Pénétration</h4>
                <p>Tests trimestriels par des experts en cybersécurité externes pour identifier les vulnérabilités.</p>
                <div className="audit-frequency">Fréquence : Trimestrielle</div>
              </div>
              <div className="audit-item">
                <h4>Audit de Code</h4>
                <p>Révision complète du code source par des analystes sécurité avec outils automatisés SAST/DAST.</p>
                <div className="audit-frequency">Fréquence : Continue</div>
              </div>
              <div className="audit-item">
                <h4>Évaluation RGPD</h4>
                <p>Audit annuel de conformité par des juristes spécialisés en protection des données.</p>
                <div className="audit-frequency">Fréquence : Annuelle</div>
              </div>
              <div className="audit-item">
                <h4>Test de Résilience</h4>
                <p>Simulation d'attaques et de pannes pour valider nos procédures de récupération.</p>
                <div className="audit-frequency">Fréquence : Semestrielle</div>
              </div>
            </div>
          </section>

          {/* User Rights */}
          <section className="user-rights">
            <h2>⚖️ Vos Droits</h2>
            <div className="rights-grid">
              <div className="right-item">
                <span className="right-icon">👁️</span>
                <h4>Droit d'Accès</h4>
                <p>Consultez toutes les données que nous détenons sur vous via votre tableau de bord ou sur demande.</p>
              </div>
              <div className="right-item">
                <span className="right-icon">✏️</span>
                <h4>Droit de Rectification</h4>
                <p>Corrigez ou mettez à jour vos informations personnelles à tout moment depuis votre compte.</p>
              </div>
              <div className="right-item">
                <span className="right-icon">🗑️</span>
                <h4>Droit à l'Effacement</h4>
                <p>Supprimez définitivement votre compte et toutes vos données en un clic ("droit à l'oubli").</p>
              </div>
              <div className="right-item">
                <span className="right-icon">📦</span>
                <h4>Droit à la Portabilité</h4>
                <p>Exportez vos données dans un format lisible (JSON, CSV) pour les transférer ailleurs.</p>
              </div>
              <div className="right-item">
                <span className="right-icon">🚫</span>
                <h4>Droit d'Opposition</h4>
                <p>Opposez-vous au traitement de vos données pour des finalités spécifiques.</p>
              </div>
              <div className="right-item">
                <span className="right-icon">⏸️</span>
                <h4>Droit de Limitation</h4>
                <p>Demandez la suspension temporaire du traitement de vos données personnelles.</p>
              </div>
            </div>
          </section>

          {/* Contact Security */}
          <section className="security-contact">
            <div className="contact-card">
              <h3>🔐 Questions de Sécurité ?</h3>
              <p>
                Notre équipe sécurité est disponible pour répondre à toutes vos questions. 
                Signalez tout incident de sécurité immédiatement.
              </p>
              <div className="contact-actions">
                <Link to="/contact" className="btn btn-primary">
                  📧 Contacter la Sécurité
                </Link>
                <a href="mailto:ktaylconsult@gmail.com?subject=Security%20Issue" className="btn btn-outline">
                  🚨 Signaler un Incident
                </a>
              </div>
              <div className="emergency-contact">
                <p><strong>Urgence sécurité :</strong> Réponse rapide pour incidents critiques</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Security;