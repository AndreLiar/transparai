import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const CookiePolicy: React.FC = () => {
  return (
    <div className="legal-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>Politique de Gestion des Cookies</h1>
          <p className="last-updated">Dernière mise à jour : 2 novembre 2025</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <section>
            <h2>1. Qu'est-ce qu'un cookie ?</h2>
            <p>
              Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez notre site web. 
              Ils nous permettent de vous reconnaître et d'améliorer votre expérience utilisateur sur TransparAI.
            </p>
            <p>
              Notre plateforme utilise uniquement des cookies essentiels et fonctionnels, sans aucun cookie de suivi 
              publicitaire ou de marketing. Nous respectons votre vie privée et ne collectons que les données 
              strictement nécessaires au fonctionnement du service.
            </p>
          </section>

          <section>
            <h2>2. Types de cookies utilisés par TransparAI</h2>
            
            <h3>2.1 Cookies strictement nécessaires</h3>
            <div className="cookie-category essential">
              <h4>🔒 Cookies d'authentification Firebase</h4>
              <ul>
                <li><strong>Noms :</strong> <code>__session</code>, <code>firebase-heartbeat-*</code></li>
                <li><strong>Finalité :</strong> Maintenir votre connexion sécurisée à la plateforme</li>
                <li><strong>Durée :</strong> Session navigateur (supprimés à la fermeture)</li>
                <li><strong>Stockage :</strong> SessionStorage (aucune persistance locale)</li>
                <li><strong>Désactivation :</strong> Impossible - nécessaires au fonctionnement</li>
              </ul>
            </div>

            <div className="cookie-category essential">
              <h4>🛡️ Cookies de sécurité CSRF</h4>
              <ul>
                <li><strong>Finalité :</strong> Protection contre les attaques de falsification de requêtes</li>
                <li><strong>Durée :</strong> Session</li>
                <li><strong>Données :</strong> Token de sécurité anonyme</li>
              </ul>
            </div>

            <h3>2.2 Cookies de performance et fonctionnalité</h3>
            <div className="cookie-category functional">
              <h4>⚙️ Préférences utilisateur</h4>
              <ul>
                <li><strong>Langue d'interface :</strong> Français/Anglais</li>
                <li><strong>Thème d'affichage :</strong> Clair/Sombre</li>
                <li><strong>Paramètres du tableau de bord :</strong> Disposition, tri, filtres</li>
                <li><strong>Durée :</strong> Maximum 30 jours</li>
                <li><strong>Désactivation :</strong> Possible (perte des paramètres personnalisés)</li>
              </ul>
            </div>

            <div className="cookie-category functional">
              <h4>📊 Données de session</h4>
              <ul>
                <li><strong>État de navigation :</strong> Page courante, historique de navigation</li>
                <li><strong>Analyses en cours :</strong> Données temporaires pendant le traitement</li>
                <li><strong>Cache de résultats :</strong> Amélioration des performances</li>
                <li><strong>Durée :</strong> Session uniquement</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>3. Technologies complémentaires</h2>
            <div className="tech-section">
              <h3>3.1 Stockage local (Local Storage)</h3>
              <ul>
                <li>Paramètres d'interface non sensibles</li>
                <li>Préférences d'affichage</li>
                <li>Pas d'informations personnelles identifiables</li>
              </ul>

              <h3>3.2 Stockage de session (Session Storage)</h3>
              <ul>
                <li>Données temporaires de la session en cours</li>
                <li>Suppression automatique à la fermeture du navigateur</li>
                <li>Navigation fluide entre les pages</li>
              </ul>

              <h3>3.3 Base de données IndexedDB</h3>
              <ul>
                <li>Cache temporaire des résultats d'analyse</li>
                <li>Amélioration des performances</li>
                <li>Suppression automatique après traitement</li>
                <li>Aucune donnée sensible stockée</li>
              </ul>
            </div>
          </section>

          <section>
            <h2>4. Durée de conservation des cookies</h2>
            <div className="retention-info">
              <div className="retention-item">
                <h4>🕐 Cookies de session</h4>
                <p>Supprimés automatiquement à la fermeture du navigateur</p>
              </div>
              <div className="retention-item">
                <h4>📅 Cookies persistants</h4>
                <p>Maximum 30 jours pour les préférences utilisateur</p>
              </div>
              <div className="retention-item">
                <h4>🗑️ Cache d'analyse</h4>
                <p>Supprimé immédiatement après traitement des documents</p>
              </div>
              <div className="retention-item">
                <h4>🔄 Renouvellement automatique</h4>
                <p>Les cookies sont renouvelés uniquement lors de l'utilisation active</p>
              </div>
            </div>
          </section>

          <section>
            <h2>5. Gestion et contrôle de vos cookies</h2>
            
            <h3>5.1 Contrôle via votre navigateur</h3>
            <div className="browser-controls">
              <div className="browser-item">
                <h4>🌐 Chrome</h4>
                <p>Paramètres → Confidentialité et sécurité → Cookies et autres données des sites</p>
              </div>
              <div className="browser-item">
                <h4>🦊 Firefox</h4>
                <p>Paramètres → Vie privée et sécurité → Cookies et données de sites</p>
              </div>
              <div className="browser-item">
                <h4>🧭 Safari</h4>
                <p>Préférences → Confidentialité → Gérer les données de sites web</p>
              </div>
              <div className="browser-item">
                <h4>🔵 Edge</h4>
                <p>Paramètres → Cookies et autorisations de site → Cookies et données stockées</p>
              </div>
            </div>

            <h3>5.2 Impact de la désactivation</h3>
            <div className="impact-warning">
              <h4>⚠️ Cookies essentiels</h4>
              <p>Ne peuvent pas être désactivés car ils sont indispensables au fonctionnement de TransparAI</p>
              
              <h4>🔧 Cookies de préférence</h4>
              <p>Peuvent être supprimés mais entraîneront la perte de vos paramètres personnalisés</p>
            </div>
          </section>

          <section>
            <h2>6. Services tiers et leurs cookies</h2>
            
            <h3>6.1 Stripe (Paiements)</h3>
            <ul>
              <li><strong>Finalité :</strong> Traitement sécurisé des paiements</li>
              <li><strong>Cookies :</strong> Sécurité et prévention des fraudes</li>
              <li><strong>Politique :</strong> <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></li>
              <li><strong>Contrôle :</strong> Gestion via les paramètres Stripe</li>
            </ul>

            <h3>6.2 Firebase (Google)</h3>
            <ul>
              <li><strong>Finalité :</strong> Authentification et hébergement sécurisé</li>
              <li><strong>Cookies :</strong> Techniques et de sécurité uniquement</li>
              <li><strong>Politique :</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></li>
              <li><strong>Données :</strong> Aucune donnée personnelle partagée avec Google</li>
            </ul>

            <div className="third-party-note">
              <p>
                <strong>Note importante :</strong> Nous n'avons aucun contrôle sur les cookies déposés par ces 
                services tiers. Ils respectent leurs propres politiques de confidentialité et nous n'avons 
                pas accès aux données personnelles qu'ils peuvent collecter.
              </p>
            </div>
          </section>

          <section>
            <h2>7. Vos droits concernant les cookies</h2>
            <div className="rights-section">
              <div className="right-item">
                <h4>🔍 Droit d'information</h4>
                <p>Vous pouvez demander des informations sur les cookies utilisés</p>
              </div>
              <div className="right-item">
                <h4>🚫 Droit d'opposition</h4>
                <p>Vous pouvez refuser les cookies non essentiels</p>
              </div>
              <div className="right-item">
                <h4>🗑️ Droit d'effacement</h4>
                <p>Vous pouvez supprimer vos cookies à tout moment</p>
              </div>
              <div className="right-item">
                <h4>📝 Droit de modification</h4>
                <p>Vous pouvez modifier vos préférences de cookies</p>
              </div>
            </div>
          </section>

          <section>
            <h2>8. Sécurité et protection des données</h2>
            <ul>
              <li><strong>Chiffrement :</strong> Tous les cookies sont transmis via HTTPS/TLS</li>
              <li><strong>Anonymisation :</strong> Aucun cookie ne contient d'informations personnelles directes</li>
              <li><strong>Limitation d'accès :</strong> Seuls nos systèmes autorisés accèdent aux cookies</li>
              <li><strong>Audit régulier :</strong> Vérification périodique de l'utilisation des cookies</li>
              <li><strong>Conformité RGPD :</strong> Respect strict de la réglementation européenne</li>
            </ul>
          </section>

          <section>
            <h2>9. Contact et support</h2>
            <p>
              Pour toute question concernant notre utilisation des cookies ou pour exercer vos droits :
            </p>
            <div className="contact-info">
              <p><strong>📧 Email :</strong> ktaylconsult@gmail.com</p>
              <p><strong>📞 Support :</strong> Via notre page <Link to="/support">Support</Link></p>
              <p><strong>⏰ Délai de réponse :</strong> 72 heures maximum</p>
            </div>
          </section>

          <section>
            <h2>10. Mises à jour de cette politique</h2>
            <p>
              Cette politique de cookies est mise à jour régulièrement pour refléter :
            </p>
            <ul>
              <li>Les évolutions de notre plateforme</li>
              <li>Les changements dans la réglementation</li>
              <li>L'amélioration de nos pratiques de protection des données</li>
            </ul>
            <p>
              <strong>Notification :</strong> Les modifications importantes vous seront notifiées par email 
              et via un bandeau d'information sur la plateforme.
            </p>
            <p>
              <strong>Historique :</strong> Consultez notre <Link to="/privacy-policy">Politique de Confidentialité</Link> 
              pour l'historique complet des modifications.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CookiePolicy;