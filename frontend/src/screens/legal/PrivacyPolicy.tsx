import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const PrivacyPolicy: React.FC = () => (
  <div className="legal-page">

    {/* ── Masthead ─────────────────────────────────────────────────────── */}
    <div className="legal-masthead">
      <div className="legal-masthead-inner">
        <Link to="/" className="legal-back">
          <i className="legal-back-arrow">&#8592;</i> Retour
        </Link>
        <div className="legal-masthead-rule" />
        <p className="legal-doc-type">Document légal</p>
        <h1 className="legal-masthead-h1">Politique de<br />Confidentialité</h1>
        <div className="legal-masthead-meta">
          <span className="legal-meta-date">Dernière mise à jour : 13 mars 2026</span>
          <span className="legal-meta-sep" />
          <span className="legal-meta-tag">RGPD conforme</span>
          <span className="legal-meta-sep" />
          <span className="legal-meta-tag">EU AI Act Art. 13</span>
        </div>
      </div>
    </div>

    {/* ── Body ─────────────────────────────────────────────────────────── */}
    <div className="legal-body">

      {/* Table of contents */}
      <nav className="legal-toc" aria-label="Table des matières">
        <p className="legal-toc-title">Sommaire</p>
        <ol className="legal-toc-list">
          <li><a href="#intro">1. Introduction</a></li>
          <li><a href="#collecte">2. Informations collectées</a></li>
          <li><a href="#usage">3. Utilisation</a></li>
          <li><a href="#protection">4. Protection des données</a></li>
          <li><a href="#partage">5. Partage des données</a></li>
          <li><a href="#droits">6. Vos droits (RGPD)</a></li>
          <li><a href="#cookies">7. Cookies</a></li>
          <li><a href="#contact">8. Contact</a></li>
          <li><a href="#modifs">9. Modifications</a></li>
        </ol>
      </nav>

      {/* 1. Introduction */}
      <section className="legal-section" id="intro">
        <span className="legal-section-num">01</span>
        <h2 className="legal-section-h2">Introduction</h2>
        <p>
          TransparAI s'engage à protéger votre vie privée. Cette politique de confidentialité
          explique comment nous collectons, utilisons et protégeons vos informations personnelles
          lorsque vous utilisez notre service d'analyse de documents contractuels par intelligence
          artificielle.
        </p>
      </section>

      {/* 2. Informations collectées */}
      <section className="legal-section" id="collecte">
        <span className="legal-section-num">02</span>
        <h2 className="legal-section-h2">Informations que nous collectons</h2>

        <h3 className="legal-section-h3">Données d'inscription</h3>
        <ul className="legal-list">
          <li>Adresse e-mail</li>
          <li>Nom d'utilisateur</li>
          <li>Informations de facturation (pour les abonnements payants)</li>
        </ul>

        <h3 className="legal-section-h3">Données d'utilisation</h3>
        <ul className="legal-list">
          <li>Documents analysés — stockés temporairement pour le traitement uniquement</li>
          <li>Historique des analyses (pour les comptes payants)</li>
          <li>Statistiques d'utilisation agrégées et anonymisées</li>
        </ul>
      </section>

      {/* 3. Utilisation */}
      <section className="legal-section" id="usage">
        <span className="legal-section-num">03</span>
        <h2 className="legal-section-h2">Comment nous utilisons vos informations</h2>
        <ul className="legal-list">
          <li><strong>Fourniture du service :</strong> traitement et analyse de vos documents</li>
          <li><strong>Amélioration du service :</strong> statistiques d'usage — vos documents ne servent jamais à entraîner des modèles d'IA</li>
          <li><strong>Communication :</strong> notifications importantes relatives à votre compte</li>
          <li><strong>Facturation :</strong> gestion des abonnements et paiements via Stripe</li>
        </ul>
      </section>

      {/* 4. Protection */}
      <section className="legal-section" id="protection">
        <span className="legal-section-num">04</span>
        <h2 className="legal-section-h2">Protection de vos données</h2>
        <p>Nous mettons en oeuvre des mesures de sécurité appropriées :</p>
        <ul className="legal-list">
          <li>Chiffrement des données en transit (HTTPS/TLS)</li>
          <li>Authentification sécurisée via Firebase Authentication</li>
          <li>Suppression automatique des documents après analyse</li>
          <li>Accès aux données limité au strict nécessaire</li>
        </ul>
      </section>

      {/* 5. Partage */}
      <section className="legal-section" id="partage">
        <span className="legal-section-num">05</span>
        <h2 className="legal-section-h2">Partage des données</h2>
        <p>
          Nous ne vendons, n'échangeons ni ne louons vos informations personnelles.
          Les données sont partagées uniquement avec nos sous-traitants sous contrat strict et DPA RGPD :
        </p>
        <table className="legal-third-party-table">
          <thead>
            <tr>
              <th>Prestataire</th>
              <th>Finalité</th>
              <th>Région</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Firebase (Google)</strong></td>
              <td>Authentification</td>
              <td>UE</td>
            </tr>
            <tr>
              <td><strong>Stripe</strong></td>
              <td>Paiements sécurisés</td>
              <td>UE / US</td>
            </tr>
            <tr>
              <td><strong>Microsoft Azure OpenAI</strong></td>
              <td>Traitement IA des documents — données non conservées</td>
              <td>Europe Ouest</td>
            </tr>
            <tr>
              <td><strong>Microsoft Azure</strong></td>
              <td>Hébergement infrastructure</td>
              <td>Europe Ouest</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* 6. Droits RGPD */}
      <section className="legal-section" id="droits">
        <span className="legal-section-num">06</span>
        <h2 className="legal-section-h2">Vos droits (RGPD)</h2>
        <p>Conformément au Règlement Général sur la Protection des Données :</p>
        <div className="legal-rights-grid">
          <div className="legal-right-cell">
            <p className="legal-right-title">Accès</p>
            <p className="legal-right-desc">Consulter les données que nous détenons sur vous.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Rectification</p>
            <p className="legal-right-desc">Corriger vos informations personnelles.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Suppression</p>
            <p className="legal-right-desc">Demander la suppression de votre compte et de vos données.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Portabilité</p>
            <p className="legal-right-desc">Exporter vos données dans un format lisible par machine.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Opposition</p>
            <p className="legal-right-desc">Vous opposer au traitement de vos données personnelles.</p>
          </div>
          <div className="legal-right-cell">
            <p className="legal-right-title">Limitation</p>
            <p className="legal-right-desc">Restreindre le traitement dans certaines circonstances.</p>
          </div>
        </div>
      </section>

      {/* 7. Cookies */}
      <section className="legal-section" id="cookies">
        <span className="legal-section-num">07</span>
        <h2 className="legal-section-h2">Gestion des cookies</h2>
        <p>
          Nous utilisons uniquement des cookies essentiels et fonctionnels.
          Aucun cookie publicitaire ou de tracking marketing n'est déposé.
          Consultez notre <Link to="/cookies">Politique de gestion des cookies</Link> pour le détail complet.
        </p>

        <h3 className="legal-section-h3">Technologies de stockage</h3>
        <ul className="legal-list">
          <li><strong>SessionStorage :</strong> authentification Firebase — supprimé à la fermeture du navigateur</li>
          <li><strong>LocalStorage :</strong> préférences d'interface (langue, thème)</li>
          <li><strong>IndexedDB :</strong> cache temporaire des résultats — supprimé après traitement</li>
        </ul>
      </section>

      {/* 8. Contact */}
      <section className="legal-section" id="contact">
        <span className="legal-section-num">08</span>
        <h2 className="legal-section-h2">Contact</h2>
        <p>
          Pour toute question ou pour exercer vos droits RGPD, contactez-nous :
        </p>
        <div className="legal-contact-block">
          <span className="legal-contact-label">Délégué à la protection des données</span>
          <a href="mailto:contact@transparai.com" className="legal-contact-email">
            contact@transparai.com
          </a>
        </div>
      </section>

      {/* 9. Modifications */}
      <section className="legal-section" id="modifs">
        <span className="legal-section-num">09</span>
        <h2 className="legal-section-h2">Modifications</h2>
        <p>
          Nous nous réservons le droit de modifier cette politique de confidentialité.
          Les modifications importantes vous seront notifiées par e-mail au moins 30 jours
          avant leur entrée en vigueur.
        </p>
      </section>

    </div>
  </div>
);

export default PrivacyPolicy;
