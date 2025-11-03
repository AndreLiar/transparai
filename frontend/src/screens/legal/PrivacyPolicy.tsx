import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="legal-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>Politique de Confidentialité</h1>
          <p className="last-updated">Dernière mise à jour : 10 octobre 2025</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <section>
            <h2>1. Introduction</h2>
            <p>
              TransparAI s'engage à protéger votre vie privée. Cette politique de confidentialité explique 
              comment nous collectons, utilisons et protégeons vos informations personnelles lorsque vous 
              utilisez notre service d'analyse de conditions générales d'abonnement par intelligence artificielle.
            </p>
          </section>

          <section>
            <h2>2. Informations que nous collectons</h2>
            <h3>2.1 Informations d'inscription</h3>
            <ul>
              <li>Adresse e-mail</li>
              <li>Nom d'utilisateur</li>
              <li>Informations de facturation (pour les abonnements payants)</li>
            </ul>
            
            <h3>2.2 Données d'utilisation</h3>
            <ul>
              <li>Documents analysés (stockés temporairement pour le traitement)</li>
              <li>Historique des analyses (pour les comptes Premium)</li>
              <li>Statistiques d'utilisation du service</li>
            </ul>
          </section>

          <section>
            <h2>3. Comment nous utilisons vos informations</h2>
            <ul>
              <li><strong>Fourniture du service :</strong> Traitement et analyse de vos documents CGA</li>
              <li><strong>Amélioration du service :</strong> Optimisation de nos algorithmes d'IA</li>
              <li><strong>Communication :</strong> Envoi de notifications importantes sur votre compte</li>
              <li><strong>Facturation :</strong> Gestion des abonnements et paiements</li>
            </ul>
          </section>

          <section>
            <h2>4. Protection de vos données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos informations :
            </p>
            <ul>
              <li>Chiffrement des données en transit (HTTPS/TLS)</li>
              <li>Authentification sécurisée via Firebase Authentication</li>
              <li>Suppression automatique des documents après analyse</li>
              <li>Accès limité aux données par notre équipe</li>
            </ul>
          </section>

          <section>
            <h2>5. Partage des données</h2>
            <p>
              Nous ne vendons, n'échangeons ni ne louons vos informations personnelles à des tiers. 
              Nous pouvons partager vos données uniquement dans les cas suivants :
            </p>
            <ul>
              <li>Avec votre consentement explicite</li>
              <li>Pour respecter nos obligations légales</li>
              <li>Avec nos fournisseurs de services (Firebase, Stripe) sous contrat strict</li>
            </ul>
          </section>

          <section>
            <h2>6. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul>
              <li><strong>Accès :</strong> Consulter les données que nous détenons sur vous</li>
              <li><strong>Rectification :</strong> Corriger vos informations personnelles</li>
              <li><strong>Suppression :</strong> Demander la suppression de votre compte</li>
              <li><strong>Portabilité :</strong> Exporter vos données dans un format lisible</li>
              <li><strong>Opposition :</strong> Vous opposer au traitement de vos données</li>
            </ul>
          </section>

          <section>
            <h2>7. Gestion des Cookies et Technologies Similaires</h2>
            
            <h3>7.1 Qu'est-ce qu'un cookie ?</h3>
            <p>
              Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez notre site web. 
              Ils nous permettent de vous reconnaître et d'améliorer votre expérience utilisateur.
            </p>

            <h3>7.2 Types de cookies utilisés</h3>
            
            <h4>Cookies strictement nécessaires (ne peuvent pas être désactivés)</h4>
            <ul>
              <li><strong>Cookies d'authentification Firebase :</strong>
                <ul>
                  <li>Nom : <code>__session</code>, <code>firebase-heartbeat-*</code></li>
                  <li>Durée : Session navigateur (supprimés à la fermeture)</li>
                  <li>Finalité : Maintenir votre connexion sécurisée</li>
                  <li>Stockage : SessionStorage (pas de persistance locale)</li>
                </ul>
              </li>
              <li><strong>Cookies de sécurité CSRF :</strong>
                <ul>
                  <li>Finalité : Protection contre les attaques de falsification de requêtes</li>
                  <li>Durée : Session</li>
                </ul>
              </li>
            </ul>

            <h4>Cookies de performance et fonctionnalité</h4>
            <ul>
              <li><strong>Préférences utilisateur :</strong>
                <ul>
                  <li>Langue d'interface (français/anglais)</li>
                  <li>Thème d'affichage</li>
                  <li>Paramètres d'affichage du tableau de bord</li>
                </ul>
              </li>
              <li><strong>Données de session :</strong>
                <ul>
                  <li>État de navigation dans l'application</li>
                  <li>Données temporaires des analyses en cours</li>
                </ul>
              </li>
            </ul>

            <h3>7.3 Technologies complémentaires</h3>
            <ul>
              <li><strong>Local Storage :</strong> Paramètres d'interface non sensibles</li>
              <li><strong>Session Storage :</strong> Données temporaires de session</li>
              <li><strong>IndexedDB :</strong> Cache des résultats d'analyse (supprimé automatiquement)</li>
            </ul>

            <h3>7.4 Durée de conservation</h3>
            <ul>
              <li><strong>Cookies de session :</strong> Supprimés automatiquement à la fermeture du navigateur</li>
              <li><strong>Cookies persistants :</strong> Maximum 30 jours pour les préférences</li>
              <li><strong>Cache d'analyse :</strong> Supprimé immédiatement après traitement</li>
            </ul>

            <h3>7.5 Gestion de vos cookies</h3>
            <p>Vous pouvez contrôler l'utilisation des cookies :</p>
            <ul>
              <li><strong>Dans votre navigateur :</strong> Paramètres → Confidentialité → Cookies</li>
              <li><strong>Cookies essentiels :</strong> Ne peuvent pas être désactivés (fonctionnement du service)</li>
              <li><strong>Cookies de préférence :</strong> Peuvent être supprimés (perte des paramètres personnalisés)</li>
            </ul>

            <h3>7.6 Cookies tiers</h3>
            <p>Nous utilisons des services tiers qui peuvent déposer leurs propres cookies :</p>
            <ul>
              <li><strong>Stripe :</strong> Traitement sécurisé des paiements (cookies de sécurité)</li>
              <li><strong>Firebase :</strong> Authentification et hébergement (cookies techniques)</li>
            </ul>
            <p>
              Ces services respectent leurs propres politiques de confidentialité et nous n'avons pas 
              accès aux données personnelles qu'ils collectent.
            </p>

            <h3>7.7 Mise à jour automatique</h3>
            <p>
              Cette section est mise à jour automatiquement en cas de modification de nos pratiques 
              concernant les cookies. La date de dernière modification est indiquée en haut de cette page.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>
              Pour toute question concernant cette politique de confidentialité ou pour exercer vos droits, 
              contactez-nous à :
            </p>
            <p>
              <strong>Email :</strong> ktaylconsult@gmail.com
            </p>
          </section>

          <section>
            <h2>9. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité. 
              Les modifications importantes vous seront notifiées par e-mail.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;