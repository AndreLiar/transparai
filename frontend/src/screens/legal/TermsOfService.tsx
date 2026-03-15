import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const TermsOfService: React.FC = () => (
  <div className="legal-page">

    {/* ── Masthead ─────────────────────────────────────────────────────── */}
    <div className="legal-masthead">
      <div className="legal-masthead-inner">
        <Link to="/" className="legal-back">
          <i className="legal-back-arrow">&#8592;</i> Retour
        </Link>
        <div className="legal-masthead-rule" />
        <p className="legal-doc-type">Document légal</p>
        <h1 className="legal-masthead-h1">Conditions Générales<br />d'Utilisation</h1>
        <div className="legal-masthead-meta">
          <span className="legal-meta-date">Dernière mise à jour : 2 novembre 2025</span>
          <span className="legal-meta-sep" />
          <span className="legal-meta-tag">Droit français</span>
        </div>
      </div>
    </div>

    {/* ── Body ─────────────────────────────────────────────────────────── */}
    <div className="legal-body">

      {/* Table of contents */}
      <nav className="legal-toc" aria-label="Table des matières">
        <p className="legal-toc-title">Sommaire</p>
        <ol className="legal-toc-list">
          <li><a href="#presentation">1. Présentation du service</a></li>
          <li><a href="#acceptation">2. Acceptation des conditions</a></li>
          <li><a href="#services">3. Description des services</a></li>
          <li><a href="#usage">4. Utilisation acceptable</a></li>
          <li><a href="#pi">5. Propriété intellectuelle</a></li>
          <li><a href="#responsabilite">6. Limitation de responsabilité</a></li>
          <li><a href="#facturation">7. Facturation et résiliation</a></li>
          <li><a href="#donnees">8. Protection des données</a></li>
          <li><a href="#disponibilite">9. Disponibilité du service</a></li>
          <li><a href="#modifications">10. Modifications des conditions</a></li>
          <li><a href="#droit">11. Droit applicable</a></li>
          <li><a href="#contact">12. Contact</a></li>
        </ol>
      </nav>

      {/* 1. Présentation */}
      <section className="legal-section" id="presentation">
        <span className="legal-section-num">01</span>
        <h2 className="legal-section-h2">Présentation du service</h2>
        <p>
          TransparAI est un service d'analyse automatisée de contrats, conditions générales d'utilisation
          et conditions générales de vente (CGV/CGU/CGA) par intelligence artificielle. Notre plateforme
          permet aux utilisateurs d'obtenir des résumés en langage clair, des scores de transparence et
          une détection des clauses à risque.
        </p>
      </section>

      {/* 2. Acceptation */}
      <section className="legal-section" id="acceptation">
        <span className="legal-section-num">02</span>
        <h2 className="legal-section-h2">Acceptation des conditions</h2>
        <p>
          En utilisant TransparAI, vous acceptez les présentes conditions générales d'utilisation
          dans leur intégralité. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
        </p>
      </section>

      {/* 3. Services */}
      <section className="legal-section" id="services">
        <span className="legal-section-num">03</span>
        <h2 className="legal-section-h2">Description des services</h2>

        <div className="legal-plan-block">
          <div className="legal-plan-head">
            <span className="legal-plan-name">Gratuit</span>
            <span className="legal-plan-price">0 €</span>
          </div>
          <div className="legal-plan-body">
            <ul className="legal-list">
              <li>5 analyses par mois</li>
              <li>Score de transparence et résumé en langage clair</li>
              <li>Détection des clauses à risque</li>
              <li>Export PDF des résultats</li>
            </ul>
          </div>
        </div>

        <div className="legal-plan-block">
          <div className="legal-plan-head">
            <span className="legal-plan-name">Standard</span>
            <span className="legal-plan-price">14,99 € / mois</span>
          </div>
          <div className="legal-plan-body">
            <ul className="legal-list">
              <li>100 analyses par mois</li>
              <li>Upload PDF et OCR</li>
              <li>Analyse IA avancée (GPT-4o mini)</li>
              <li>Historique 90 jours</li>
              <li>Export PDF — documents jusqu'à 100 000 caractères</li>
            </ul>
          </div>
        </div>

        <div className="legal-plan-block">
          <div className="legal-plan-head">
            <span className="legal-plan-name">Premium</span>
            <span className="legal-plan-price">29,99 € / mois</span>
          </div>
          <div className="legal-plan-body">
            <ul className="legal-list">
              <li>Analyses illimitées</li>
              <li>IA haute précision (GPT-4o)</li>
              <li>Historique 2 ans</li>
              <li>Export PDF — support prioritaire</li>
            </ul>
          </div>
        </div>

        <div className="legal-plan-block">
          <div className="legal-plan-head">
            <span className="legal-plan-name">Enterprise</span>
            <span className="legal-plan-price">199 € / mois</span>
          </div>
          <div className="legal-plan-body">
            <ul className="legal-list">
              <li>Analyses illimitées pour l'équipe</li>
              <li>GPT-4o prioritaire</li>
              <li>Gestion multi-utilisateurs</li>
              <li>Journal d'audit (EU AI Act Art. 12)</li>
              <li>SLA garanti et support dédié</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. Usage acceptable */}
      <section className="legal-section" id="usage">
        <span className="legal-section-num">04</span>
        <h2 className="legal-section-h2">Utilisation acceptable</h2>
        <p>En utilisant TransparAI, vous vous engagez à :</p>
        <ul className="legal-list">
          <li>Utiliser le service conformément aux lois en vigueur</li>
          <li>Ne pas tenter de contourner les limitations techniques du service</li>
          <li>Ne pas partager vos identifiants de connexion</li>
          <li>Ne pas soumettre de documents illégaux ou portant atteinte à des droits de tiers</li>
          <li>Respecter les droits de propriété intellectuelle</li>
        </ul>
      </section>

      {/* 5. PI */}
      <section className="legal-section" id="pi">
        <span className="legal-section-num">05</span>
        <h2 className="legal-section-h2">Propriété intellectuelle</h2>
        <p>
          TransparAI et tous ses contenus (logos, design, algorithmes, modèles d'analyse) sont protégés
          par les droits de propriété intellectuelle. Les analyses générées appartiennent à l'utilisateur ;
          la technologie sous-jacente reste la propriété exclusive de TransparAI.
        </p>
      </section>

      {/* 6. Responsabilité */}
      <section className="legal-section" id="responsabilite">
        <span className="legal-section-num">06</span>
        <h2 className="legal-section-h2">Limitation de responsabilité</h2>
        <div className="legal-notice">
          <p>
            TransparAI fournit des analyses automatisées à titre informatif uniquement.
            Nos analyses ne constituent en aucun cas des conseils juridiques. Pour des décisions
            importantes, consultez un professionnel du droit qualifié.
          </p>
        </div>
        <ul className="legal-list">
          <li>Nous ne garantissons pas l'exactitude absolue des analyses produites par l'IA</li>
          <li>L'IA peut commettre des erreurs d'interprétation — vérifiez toujours les résultats</li>
          <li>Nous ne sommes pas responsables des décisions prises sur la base de nos analyses</li>
          <li>Notre responsabilité est limitée au montant de votre abonnement en cours</li>
        </ul>
      </section>

      {/* 7. Facturation */}
      <section className="legal-section" id="facturation">
        <span className="legal-section-num">07</span>
        <h2 className="legal-section-h2">Facturation et résiliation</h2>

        <h3 className="legal-section-h3">Facturation</h3>
        <ul className="legal-list">
          <li>Les abonnements sont facturés mensuellement en début de période</li>
          <li>Le paiement s'effectue par carte bancaire via Stripe, prestataire certifié PCI-DSS</li>
          <li>Les tarifs peuvent évoluer avec un préavis de 30 jours par e-mail</li>
        </ul>

        <h3 className="legal-section-h3">Résiliation</h3>
        <ul className="legal-list">
          <li>Vous pouvez résilier votre abonnement à tout moment depuis votre espace compte</li>
          <li>La résiliation prend effet à la fin de la période de facturation en cours</li>
          <li>Aucun remboursement n'est effectué pour les périodes entamées non utilisées</li>
          <li>Nous nous réservons le droit de suspendre un compte en cas de violation des présentes conditions</li>
        </ul>
      </section>

      {/* 8. Données */}
      <section className="legal-section" id="donnees">
        <span className="legal-section-num">08</span>
        <h2 className="legal-section-h2">Protection des données</h2>
        <p>
          Le traitement de vos données personnelles est régi par notre{' '}
          <Link to="/privacy-policy">Politique de Confidentialité</Link>.
          En utilisant TransparAI, vous acceptez cette politique.
        </p>
      </section>

      {/* 9. Disponibilité */}
      <section className="legal-section" id="disponibilite">
        <span className="legal-section-num">09</span>
        <h2 className="legal-section-h2">Disponibilité du service</h2>
        <p>
          Nous nous efforçons de maintenir une disponibilité maximale du service.
          Des maintenances programmées peuvent avoir lieu avec préavis. Aucune garantie
          de disponibilité ininterrompue n'est offerte sur le plan Gratuit.
        </p>
      </section>

      {/* 10. Modifications */}
      <section className="legal-section" id="modifications">
        <span className="legal-section-num">10</span>
        <h2 className="legal-section-h2">Modifications des conditions</h2>
        <p>
          Nous nous réservons le droit de modifier les présentes conditions générales.
          Les modifications importantes vous seront notifiées par e-mail au moins 30 jours
          avant leur entrée en vigueur.
        </p>
      </section>

      {/* 11. Droit */}
      <section className="legal-section" id="droit">
        <span className="legal-section-num">11</span>
        <h2 className="legal-section-h2">Droit applicable et juridiction</h2>
        <p>
          Les présentes conditions générales sont régies par le droit français.
          En cas de litige, les tribunaux français seront seuls compétents,
          sous réserve des dispositions applicables aux consommateurs.
        </p>
      </section>

      {/* 12. Contact */}
      <section className="legal-section" id="contact">
        <span className="legal-section-num">12</span>
        <h2 className="legal-section-h2">Contact</h2>
        <p>Pour toute question relative aux présentes conditions :</p>
        <div className="legal-contact-block">
          <span className="legal-contact-label">Nous contacter</span>
          <a href="mailto:contact@transparai.com" className="legal-contact-email">
            contact@transparai.com
          </a>
        </div>
      </section>

    </div>
  </div>
);

export default TermsOfService;
