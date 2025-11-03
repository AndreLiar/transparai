import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

const TermsOfService: React.FC = () => {
  return (
    <div className="legal-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>Conditions Générales d'Utilisation</h1>
          <p className="last-updated">Dernière mise à jour : 2 novembre 2025</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <section>
            <h2>1. Présentation du service</h2>
            <p>
              TransparAI est un service d'analyse automatisée de conditions générales d'abonnement (CGA) 
              utilisant l'intelligence artificielle. Notre plateforme permet aux utilisateurs d'obtenir 
              des résumés, scores de transparence et analyses détaillées de documents contractuels.
            </p>
          </section>

          <section>
            <h2>2. Acceptation des conditions</h2>
            <p>
              En utilisant TransparAI, vous acceptez ces conditions générales d'utilisation. 
              Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
            </p>
          </section>

          <section>
            <h2>3. Description des services</h2>
            
            <h3>3.1 Plan Starter (Gratuit)</h3>
            <ul>
              <li>Jusqu'à 20 analyses par mois</li>
              <li>Analyse basique des conditions générales d'abonnement</li>
              <li>Score de transparence et résumé</li>
              <li>Export PDF des résultats</li>
              <li>Pas de sauvegarde d'historique</li>
              <li>Support communautaire</li>
            </ul>
            
            <h3>3.2 Plan Standard (9,99€/mois)</h3>
            <ul>
              <li>Jusqu'à 40 analyses par mois</li>
              <li>Analyse détaillée des CGA avec points d'attention</li>
              <li>Historique complet des analyses sauvegardé</li>
              <li>Export PDF avec analyse détaillée</li>
              <li>Support prioritaire par email</li>
              <li>Accès aux nouvelles fonctionnalités en priorité</li>
            </ul>

            <h3>3.3 Plan Premium (19,99€/mois)</h3>
            <ul>
              <li>Analyses illimitées</li>
              <li>Toutes les fonctionnalités du plan Standard</li>
              <li>Analyse comparative multi-documents (jusqu'à 3 documents)</li>
              <li>Tableaux de bord analytiques avancés</li>
              <li>Alertes intelligentes et notifications personnalisées</li>
              <li>Export multi-format (PDF, Word, Excel)</li>
              <li>Support prioritaire et consultation juridique</li>
              <li>Accès anticipé aux nouvelles fonctionnalités</li>
              <li>Analyses prédictives et recommandations personnalisées</li>
            </ul>

            <h3>3.4 Plan Enterprise (99€/mois)</h3>
            <ul>
              <li>Toutes les fonctionnalités du plan Premium</li>
              <li>Gestion multi-utilisateurs avec rôles (Admin, Manager, Analyste, Viewer)</li>
              <li>Système d'invitations et permissions granulaires</li>
              <li>Analyse comparative multi-documents (jusqu'à 5 documents)</li>
              <li>Tableaux de bord avec métriques d'équipe</li>
              <li>Journal d'audit complet avec traçabilité des actions</li>
              <li>Personnalisation de la marque (logo, couleurs, nom d'entreprise)</li>
              <li>Support technique dédié et formation équipe</li>
              <li>Intégrations API personnalisées</li>
              <li>SLA garanti de 99,9% de disponibilité</li>
            </ul>
          </section>

          <section>
            <h2>4. Utilisation acceptable</h2>
            <p>Vous vous engagez à :</p>
            <ul>
              <li>Utiliser le service conformément aux lois en vigueur</li>
              <li>Ne pas tenter de contourner les limitations techniques</li>
              <li>Ne pas partager vos identifiants de connexion</li>
              <li>Ne pas analyser de documents illégaux ou inappropriés</li>
              <li>Respecter les droits de propriété intellectuelle</li>
            </ul>
          </section>

          <section>
            <h2>5. Propriété intellectuelle</h2>
            <p>
              TransparAI et tous ses contenus (logos, design, algorithmes) sont protégés par 
              les droits de propriété intellectuelle. Les analyses générées appartiennent à l'utilisateur, 
              mais la technologie reste notre propriété exclusive.
            </p>
          </section>

          <section>
            <h2>6. Limitation de responsabilité</h2>
            <p>
              <strong>Important :</strong> TransparAI fournit des analyses automatisées à titre informatif uniquement. 
              Nos analyses ne constituent pas des conseils juridiques. Pour des décisions importantes, 
              consultez un professionnel du droit.
            </p>
            <ul>
              <li>Nous ne garantissons pas l'exactitude à 100% des analyses</li>
              <li>L'IA peut parfois faire des erreurs d'interprétation</li>
              <li>Nous ne sommes pas responsables des décisions prises sur la base de nos analyses</li>
              <li>Notre responsabilité est limitée au montant de votre abonnement</li>
            </ul>
          </section>

          <section>
            <h2>7. Facturation et résiliation</h2>
            <h3>7.1 Facturation</h3>
            <ul>
              <li>Les abonnements sont facturés mensuellement</li>
              <li>Le paiement se fait par carte bancaire via Stripe</li>
              <li>Les tarifs peuvent évoluer avec un préavis de 30 jours</li>
            </ul>

            <h3>7.2 Résiliation</h3>
            <ul>
              <li>Vous pouvez résilier à tout moment depuis votre compte</li>
              <li>La résiliation prend effet à la fin de la période facturée</li>
              <li>Aucun remboursement pour les périodes non utilisées</li>
              <li>Nous pouvons suspendre votre compte en cas de violation des conditions</li>
            </ul>
          </section>

          <section>
            <h2>8. Protection des données</h2>
            <p>
              Le traitement de vos données personnelles est régi par notre 
              <Link to="/privacy-policy"> Politique de Confidentialité</Link>. 
              En utilisant TransparAI, vous acceptez cette politique.
            </p>
          </section>

          <section>
            <h2>9. Disponibilité du service</h2>
            <p>
              Nous nous efforçons de maintenir une disponibilité maximale, mais ne garantissons pas 
              un service ininterrompu. Des maintenances programmées peuvent avoir lieu avec préavis.
            </p>
          </section>

          <section>
            <h2>10. Modifications des conditions</h2>
            <p>
              Nous nous réservons le droit de modifier ces conditions générales. 
              Les modifications importantes vous seront notifiées par e-mail 30 jours avant leur entrée en vigueur.
            </p>
          </section>

          <section>
            <h2>11. Droit applicable et juridiction</h2>
            <p>
              Ces conditions générales sont régies par le droit français. 
              En cas de litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          <section>
            <h2>12. Contact</h2>
            <p>
              Pour toute question concernant ces conditions générales :
            </p>
            <p>
              <strong>Email :</strong> ktaylconsult@gmail.com
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;