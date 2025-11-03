export const sampleContracts = {
  'terms-of-service': {
    title: 'Conditions d\'utilisation - Service de streaming',
    content: `CONDITIONS GÉNÉRALES D'UTILISATION - STREAMFLIX

1. OBJET ET ACCEPTATION
Les présentes conditions générales d'utilisation régissent l'accès et l'utilisation de la plateforme de streaming vidéo StreamFlix.

2. DESCRIPTION DU SERVICE
StreamFlix propose un service de streaming vidéo à la demande moyennant un abonnement mensuel.

3. ABONNEMENT ET TARIFICATION
- Abonnement Standard : 9,99€/mois
- Abonnement Premium : 14,99€/mois 
- Résiliation possible à tout moment avec préavis de 30 jours
- Renouvellement automatique sauf résiliation

4. UTILISATION DU SERVICE
L'utilisateur s'engage à utiliser le service à des fins personnelles uniquement. Toute utilisation commerciale est interdite.

5. PROPRIÉTÉ INTELLECTUELLE
Tous les contenus diffusés sur StreamFlix sont protégés par des droits d'auteur. Toute reproduction ou diffusion est strictement interdite.

6. DONNÉES PERSONNELLES
StreamFlix collecte et traite vos données personnelles conformément à sa politique de confidentialité. Nous nous réservons le droit de partager certaines données avec nos partenaires commerciaux.

7. RÉSILIATION
StreamFlix se réserve le droit de résilier votre abonnement en cas de violation des présentes conditions, sans préavis ni remboursement.

8. LIMITATION DE RESPONSABILITÉ
StreamFlix ne pourra être tenu responsable de tout dommage direct ou indirect résultant de l'utilisation du service, y compris la perte de données ou l'interruption de service.

9. MODIFICATION DES CONDITIONS
StreamFlix se réserve le droit de modifier les présentes conditions à tout moment. Les modifications prennent effet immédiatement après publication.

10. JURIDICTION
Tout litige sera soumis aux tribunaux de Paris, France.`
  },
  
  'freelance-contract': {
    title: 'Contrat de prestation freelance',
    content: `CONTRAT DE PRESTATION DE SERVICES - DÉVELOPPEMENT WEB

Entre :
Entreprise TechCorp SAS, 123 Rue de la République, 75001 Paris
Et :
Jean Dupont, développeur freelance, auto-entrepreneur

1. OBJET DE LA MISSION
Développement d'un site web e-commerce responsive avec interface d'administration.

2. DURÉE ET DÉLAIS
- Durée prévisionnelle : 3 mois
- Date de début : 1er janvier 2024
- Livraison finale : 31 mars 2024
- Retard de livraison : pénalités de 100€ par jour

3. RÉMUNÉRATION
- Montant total : 15 000€ HT
- Paiement en 3 fois : 30% à la signature, 40% à mi-parcours, 30% à la livraison
- Délai de paiement : 45 jours fin de mois

4. PROPRIÉTÉ INTELLECTUELLE
Tous les développements réalisés dans le cadre de cette mission deviennent la propriété exclusive de TechCorp dès le paiement intégral.

5. OBLIGATIONS DU PRESTATAIRE
- Exclusivité totale pendant la durée de la mission
- Interdiction de travailler pour des concurrents pendant 12 mois après la fin de mission
- Confidentialité absolue sur tous les éléments du projet

6. RÉSILIATION
TechCorp peut résilier le contrat à tout moment avec un préavis de 7 jours. En cas de résiliation, le prestataire ne percevra que 50% des sommes dues.

7. GARANTIE
Le prestataire garantit son travail pendant 6 mois. Toute intervention de maintenance sera facturée au tarif horaire de 80€.

8. FORCE MAJEURE
Ne sont pas considérés comme force majeure : les pannes informatiques, les problèmes de connexion internet, ou les absences pour maladie.`
  },

  'rental-agreement': {
    title: 'Contrat de location saisonnière',
    content: `CONTRAT DE LOCATION SAISONNIÈRE - APPARTEMENT PARIS

Propriétaire : Marie Martin, 45 Avenue des Champs, 75008 Paris
Locataire : [À compléter]

1. OBJET DE LA LOCATION
Location d'un studio meublé de 25m² situé 12 Rue Montmartre, 75001 Paris.

2. DURÉE ET PRIX
- Période : du [date] au [date] (minimum 7 nuits)
- Prix : 120€ par nuit
- Frais de ménage obligatoires : 80€
- Taxe de séjour : 2€ par personne et par nuit

3. DÉPÔT DE GARANTIE
Un dépôt de garantie de 500€ est exigé avant l'arrivée. Ce dépôt sera intégralement conservé en cas de dégradation, même mineure.

4. CONDITIONS D'ANNULATION
- Annulation plus de 30 jours avant : remboursement à 100%
- Annulation entre 15 et 30 jours : remboursement à 50%
- Annulation moins de 15 jours : aucun remboursement
- Annulation pour cause de Covid-19 : aucun remboursement

5. RÈGLEMENT INTÉRIEUR
- Interdiction formelle de faire du bruit après 20h
- Nombre maximum d'occupants : 2 personnes (amendes de 100€ par personne supplémentaire)
- Interdiction de fumer (amende de 200€)
- Pas de visiteurs autorisés

6. ÉTAT DES LIEUX
L'état des lieux d'entrée sera réalisé uniquement par le propriétaire. Le locataire ne peut pas contester les éventuels dommages constatés.

7. RESPONSABILITÉ
Le locataire est responsable de tous les dommages causés au logement et aux parties communes de l'immeuble, même en cas d'accident.

8. ASSURANCE
Le locataire doit fournir une attestation d'assurance villégiature. À défaut, il devra souscrire l'assurance proposée par le propriétaire pour 15€ par jour.`
  }
};

export const getSampleContract = (type: string) => {
  return sampleContracts[type as keyof typeof sampleContracts] || null;
};