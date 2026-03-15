import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const CookiePolicy: React.FC = () => (
  <div className="legal-page">

    {/* ── Masthead ─────────────────────────────────────────────────────── */}
    <div className="legal-masthead">
      <div className="legal-masthead-inner">
        <Link to="/" className="legal-back">
          <i className="legal-back-arrow">&#8592;</i> Retour
        </Link>
        <div className="legal-masthead-rule" />
        <p className="legal-doc-type">Document légal</p>
        <h1 className="legal-masthead-h1">Gestion<br />des Cookies</h1>
        <div className="legal-masthead-meta">
          <span className="legal-meta-date">Dernière mise à jour : 2 novembre 2025</span>
          <span className="legal-meta-sep" />
          <span className="legal-meta-tag">RGPD conforme</span>
        </div>
      </div>
    </div>

    {/* ── Body ─────────────────────────────────────────────────────────── */}
    <div className="legal-body">

      {/* Table of contents */}
      <nav className="legal-toc" aria-label="Table des matières">
        <p className="legal-toc-title">Sommaire</p>
        <ol className="legal-toc-list">
          <li><a href="#definition">1. Définition</a></li>
          <li><a href="#types">2. Types de cookies utilisés</a></li>
          <li><a href="#technologies">3. Technologies complémentaires</a></li>
          <li><a href="#duree">4. Durée de conservation</a></li>
          <li><a href="#controle">5. Contrôle de vos cookies</a></li>
          <li><a href="#tiers">6. Services tiers</a></li>
          <li><a href="#droits">7. Vos droits</a></li>
          <li><a href="#securite">8. Sécurité</a></li>
          <li><a href="#contact">9. Contact</a></li>
          <li><a href="#mises-a-jour">10. Mises à jour</a></li>
        </ol>
      </nav>

      {/* 1. Définition */}
      <section className="legal-section" id="definition">
        <span className="legal-section-num">01</span>
        <h2 className="legal-section-h2">Qu'est-ce qu'un cookie ?</h2>
        <p>
          Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez
          notre site web. Ils permettent de maintenir votre session, de mémoriser vos préférences
          et d'assurer le bon fonctionnement du service.
        </p>
        <p>
          TransparAI utilise uniquement des cookies essentiels et fonctionnels.
          Aucun cookie publicitaire ou de tracking marketing n'est déposé sur votre appareil.
        </p>
      </section>

      {/* 2. Types de cookies */}
      <section className="legal-section" id="types">
        <span className="legal-section-num">02</span>
        <h2 className="legal-section-h2">Types de cookies utilisés</h2>

        <h3 className="legal-section-h3">Cookies strictement nécessaires</h3>

        <div className="legal-cookie-block">
          <div className="legal-cookie-block-head">
            <span className="legal-cookie-block-name">Authentification Firebase</span>
            <span className="legal-cookie-block-tag">Essentiel</span>
          </div>
          <div className="legal-cookie-block-body">
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Noms</span>
              <span className="legal-cookie-row-val"><code>__session</code>, <code>firebase-heartbeat-*</code></span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Finalité</span>
              <span className="legal-cookie-row-val">Maintenir votre connexion sécurisée à la plateforme</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Durée</span>
              <span className="legal-cookie-row-val">Session navigateur — supprimés à la fermeture</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Stockage</span>
              <span className="legal-cookie-row-val">SessionStorage (aucune persistance locale)</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Désactivation</span>
              <span className="legal-cookie-row-val">Impossible — nécessaires au fonctionnement du service</span>
            </div>
          </div>
        </div>

        <div className="legal-cookie-block">
          <div className="legal-cookie-block-head">
            <span className="legal-cookie-block-name">Sécurité CSRF</span>
            <span className="legal-cookie-block-tag">Essentiel</span>
          </div>
          <div className="legal-cookie-block-body">
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Finalité</span>
              <span className="legal-cookie-row-val">Protection contre les attaques de falsification de requêtes (CSRF)</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Données</span>
              <span className="legal-cookie-row-val">Token de sécurité anonyme, sans information personnelle</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Durée</span>
              <span className="legal-cookie-row-val">Session</span>
            </div>
          </div>
        </div>

        <h3 className="legal-section-h3">Cookies fonctionnels</h3>

        <div className="legal-cookie-block">
          <div className="legal-cookie-block-head">
            <span className="legal-cookie-block-name">Préférences utilisateur</span>
            <span className="legal-cookie-block-tag legal-cookie-block-tag--optional">Fonctionnel</span>
          </div>
          <div className="legal-cookie-block-body">
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Contenu</span>
              <span className="legal-cookie-row-val">Langue d'interface, thème (clair/sombre), paramètres du tableau de bord</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Durée</span>
              <span className="legal-cookie-row-val">Maximum 30 jours</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Désactivation</span>
              <span className="legal-cookie-row-val">Possible — entraîne la perte des paramètres personnalisés</span>
            </div>
          </div>
        </div>

        <div className="legal-cookie-block">
          <div className="legal-cookie-block-head">
            <span className="legal-cookie-block-name">Données de session</span>
            <span className="legal-cookie-block-tag legal-cookie-block-tag--optional">Fonctionnel</span>
          </div>
          <div className="legal-cookie-block-body">
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Contenu</span>
              <span className="legal-cookie-row-val">État de navigation, données temporaires des analyses en cours</span>
            </div>
            <div className="legal-cookie-row">
              <span className="legal-cookie-row-key">Durée</span>
              <span className="legal-cookie-row-val">Session uniquement</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Technologies complémentaires */}
      <section className="legal-section" id="technologies">
        <span className="legal-section-num">03</span>
        <h2 className="legal-section-h2">Technologies complémentaires</h2>
        <div className="legal-grid-2">
          <div className="legal-grid-cell">
            <span className="legal-grid-cell-label">Local Storage</span>
            <span className="legal-grid-cell-value">Paramètres d'interface non sensibles — préférences d'affichage</span>
          </div>
          <div className="legal-grid-cell">
            <span className="legal-grid-cell-label">Session Storage</span>
            <span className="legal-grid-cell-value">Données temporaires — supprimées automatiquement à la fermeture</span>
          </div>
          <div className="legal-grid-cell">
            <span className="legal-grid-cell-label">IndexedDB</span>
            <span className="legal-grid-cell-value">Cache temporaire des résultats d'analyse — supprimé après traitement</span>
          </div>
          <div className="legal-grid-cell">
            <span className="legal-grid-cell-label">Aucun tracking</span>
            <span className="legal-grid-cell-value">Aucun pixel publicitaire, aucun cookie tiers de tracking marketing</span>
          </div>
        </div>
      </section>

      {/* 4. Durée */}
      <section className="legal-section" id="duree">
        <span className="legal-section-num">04</span>
        <h2 className="legal-section-h2">Durée de conservation</h2>
        <ul className="legal-list">
          <li><strong>Cookies de session :</strong> supprimés automatiquement à la fermeture du navigateur</li>
          <li><strong>Cookies persistants :</strong> maximum 30 jours pour les préférences utilisateur</li>
          <li><strong>Cache d'analyse :</strong> supprimé immédiatement après le traitement du document</li>
          <li><strong>Renouvellement :</strong> les cookies sont renouvelés uniquement lors de l'utilisation active</li>
        </ul>
      </section>

      {/* 5. Contrôle */}
      <section className="legal-section" id="controle">
        <span className="legal-section-num">05</span>
        <h2 className="legal-section-h2">Contrôle de vos cookies</h2>

        <h3 className="legal-section-h3">Paramètres par navigateur</h3>
        <div className="legal-browser-grid">
          <div className="legal-browser-cell">
            <p className="legal-browser-name">Chrome</p>
            <p className="legal-browser-path">Paramètres &rarr; Confidentialité et sécurité &rarr; Cookies</p>
          </div>
          <div className="legal-browser-cell">
            <p className="legal-browser-name">Firefox</p>
            <p className="legal-browser-path">Paramètres &rarr; Vie privée et sécurité &rarr; Cookies</p>
          </div>
          <div className="legal-browser-cell">
            <p className="legal-browser-name">Safari</p>
            <p className="legal-browser-path">Préférences &rarr; Confidentialité &rarr; Données de sites web</p>
          </div>
          <div className="legal-browser-cell">
            <p className="legal-browser-name">Edge</p>
            <p className="legal-browser-path">Paramètres &rarr; Cookies et autorisations de site</p>
          </div>
        </div>

        <h3 className="legal-section-h3">Impact de la désactivation</h3>
        <div className="legal-callout">
          <p>
            <strong>Cookies essentiels :</strong> ne peuvent pas être désactivés —
            ils sont indispensables au fonctionnement de TransparAI (authentification, sécurité).
          </p>
        </div>
        <div className="legal-callout legal-callout--note">
          <p>
            <strong>Cookies de préférence :</strong> peuvent être supprimés librement,
            au prix de la perte de vos paramètres personnalisés (langue, thème).
          </p>
        </div>
      </section>

      {/* 6. Tiers */}
      <section className="legal-section" id="tiers">
        <span className="legal-section-num">06</span>
        <h2 className="legal-section-h2">Services tiers et leurs cookies</h2>
        <table className="legal-third-party-table">
          <thead>
            <tr>
              <th>Service</th>
              <th>Finalité</th>
              <th>Politique</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Stripe</strong></td>
              <td>Traitement sécurisé des paiements — cookies de sécurité anti-fraude</td>
              <td><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></td>
            </tr>
            <tr>
              <td><strong>Firebase (Google)</strong></td>
              <td>Authentification et hébergement — cookies techniques uniquement</td>
              <td><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a></td>
            </tr>
          </tbody>
        </table>
        <div className="legal-callout legal-callout--note">
          <p>
            Nous n'avons aucun contrôle sur les cookies déposés par ces services tiers.
            Ils respectent leurs propres politiques de confidentialité et nous n'avons
            pas accès aux données personnelles qu'ils collectent.
          </p>
        </div>
      </section>

      {/* 7. Droits */}
      <section className="legal-section" id="droits">
        <span className="legal-section-num">07</span>
        <h2 className="legal-section-h2">Vos droits concernant les cookies</h2>
        <div className="legal-rights-grid">
          <div className="legal-right-cell">
            <p className="legal-right-title">Droit d'information</p>
            <p className="legal-right-desc">Vous pouvez demander des informations détaillées sur les cookies utilisés.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Droit d'opposition</p>
            <p className="legal-right-desc">Vous pouvez refuser les cookies non essentiels via votre navigateur.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Droit d'effacement</p>
            <p className="legal-right-desc">Vous pouvez supprimer tous les cookies stockés par TransparAI à tout moment.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Droit de modification</p>
            <p className="legal-right-desc">Vous pouvez modifier vos préférences de cookies dans les paramètres.</p>
          </div>
        </div>
      </section>

      {/* 8. Sécurité */}
      <section className="legal-section" id="securite">
        <span className="legal-section-num">08</span>
        <h2 className="legal-section-h2">Sécurité et protection des données</h2>
        <ul className="legal-list">
          <li><strong>Chiffrement :</strong> tous les cookies sont transmis exclusivement via HTTPS/TLS</li>
          <li><strong>Anonymisation :</strong> aucun cookie ne contient d'informations personnelles directes</li>
          <li><strong>Limitation d'accès :</strong> seuls nos systèmes autorisés accèdent aux données de session</li>
          <li><strong>Conformité RGPD :</strong> respect strict de la réglementation européenne sur la protection des données</li>
        </ul>
      </section>

      {/* 9. Contact */}
      <section className="legal-section" id="contact">
        <span className="legal-section-num">09</span>
        <h2 className="legal-section-h2">Contact et support</h2>
        <p>
          Pour toute question concernant notre utilisation des cookies ou pour exercer vos droits :
        </p>
        <div className="legal-contact-block">
          <span className="legal-contact-label">Délai de réponse — 72 heures maximum</span>
          <a href="mailto:contact@transparai.com" className="legal-contact-email">
            contact@transparai.com
          </a>
        </div>
      </section>

      {/* 10. Mises à jour */}
      <section className="legal-section" id="mises-a-jour">
        <span className="legal-section-num">10</span>
        <h2 className="legal-section-h2">Mises à jour de cette politique</h2>
        <p>
          Cette politique est mise à jour régulièrement pour refléter les évolutions de notre
          plateforme et les changements réglementaires. Les modifications importantes sont
          notifiées par e-mail et via un bandeau d'information sur la plateforme.
        </p>
        <p>
          Consultez notre <Link to="/privacy-policy">Politique de Confidentialité</Link> pour
          l'historique complet des modifications et la liste exhaustive des traitements de données.
        </p>
      </section>

    </div>
  </div>
);

export default CookiePolicy;
