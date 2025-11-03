// Backend/utils/analysisTemplates.js

const INDUSTRY_TEMPLATES = {
  banking: {
    name: 'Services Bancaires',
    criteria: [
      'Frais de tenue de compte',
      'Conditions de découvert',
      'Frais de virements',
      'Assurance des dépôts',
      'Protection des données financières',
      'Procédures de réclamation',
      'Transparence des taux',
      'Conditions de clôture de compte',
    ],
    compliance: ['PCI DSS', 'GDPR', 'PSD2', 'Directive sur les services de paiement'],
    weights: {
      'Transparence des conditions': 0.25,
      'Protection des données': 0.20,
      'Frais cachés': 0.20,
      'Facilité de résiliation': 0.15,
      'Garanties offertes': 0.15,
      'Modalités de recours': 0.05,
    },
  },

  insurance: {
    name: 'Assurance',
    criteria: [
      'Couverture des sinistres',
      'Exclusions de garantie',
      'Délais de remboursement',
      'Procédures de réclamation',
      'Franchise applicable',
      'Résiliation anticipée',
      'Conditions de renouvellement',
      'Protection juridique',
    ],
    compliance: ['Code des assurances', 'GDPR', 'Directive Solvabilité II'],
    weights: {
      'Transparence des conditions': 0.20,
      'Garanties offertes': 0.30,
      'Frais cachés': 0.15,
      'Facilité de résiliation': 0.15,
      'Protection des données': 0.10,
      'Modalités de recours': 0.10,
    },
  },

  saas: {
    name: 'Logiciel en tant que Service (SaaS)',
    criteria: [
      'Disponibilité du service (SLA)',
      'Sauvegarde des données',
      'Responsabilité en cas de panne',
      'Conditions de résiliation',
      'Portabilité des données',
      'Sécurité et chiffrement',
      'Support technique',
      'Évolution des fonctionnalités',
    ],
    compliance: ['GDPR', 'ISO 27001', 'SOC 2', 'Cloud Security Alliance'],
    weights: {
      'Protection des données': 0.25,
      'Garanties offertes': 0.25,
      'Transparence des conditions': 0.20,
      'Facilité de résiliation': 0.15,
      'Frais cachés': 0.10,
      'Modalités de recours': 0.05,
    },
  },

  ecommerce: {
    name: 'Commerce Électronique',
    criteria: [
      'Conditions de livraison',
      'Droit de rétractation',
      'Garanties produits',
      'Protection des achats',
      'Frais de retour',
      'Service client',
      'Sécurité des paiements',
      'Politique de remboursement',
    ],
    compliance: ['GDPR', 'Directive e-commerce', 'Code de la consommation'],
    weights: {
      'Garanties offertes': 0.25,
      'Facilité de résiliation': 0.20,
      'Transparence des conditions': 0.20,
      'Frais cachés': 0.15,
      'Protection des données': 0.15,
      'Modalités de recours': 0.05,
    },
  },

  telecom: {
    name: 'Télécommunications',
    criteria: [
      'Qualité de service',
      'Engagement de durée',
      'Frais de résiliation',
      'Conditions tarifaires',
      'Portabilité du numéro',
      'Service après-vente',
      'Couverture réseau',
      'Évolution des forfaits',
    ],
    compliance: ['GDPR', 'Code des communications électroniques', 'ARCEP'],
    weights: {
      'Facilité de résiliation': 0.25,
      'Frais cachés': 0.20,
      'Transparence des conditions': 0.20,
      'Garanties offertes': 0.20,
      'Protection des données': 0.10,
      'Modalités de recours': 0.05,
    },
  },

  default: {
    name: 'Analyse Standard',
    criteria: [
      'Transparence des conditions',
      'Facilité de résiliation',
      'Frais cachés',
      'Protection des données',
      'Garanties offertes',
      'Modalités de recours',
    ],
    compliance: ['GDPR', 'Code de la consommation'],
    weights: {
      'Transparence des conditions': 0.20,
      'Facilité de résiliation': 0.20,
      'Frais cachés': 0.20,
      'Protection des données': 0.15,
      'Garanties offertes': 0.15,
      'Modalités de recours': 0.10,
    },
  },
};

const getAnalysisTemplate = (industry = 'default') => INDUSTRY_TEMPLATES[industry] || INDUSTRY_TEMPLATES.default;

const generateIndustryPrompt = (template, documentsText) => {
  const criteriaList = template.criteria.map((c) => `- ${c}`).join('\n');
  const complianceList = template.compliance.map((c) => `- ${c}`).join('\n');

  return `
Tu es un expert juridique spécialisé dans l'analyse comparative de Conditions Générales d'Abonnement (CGA) pour le secteur ${template.name}.

MISSION : Analyser et comparer les documents fournis pour produire une analyse comparative structurée spécialisée ${template.name}.

CRITÈRES SPÉCIFIQUES À ANALYSER OBLIGATOIREMENT :
${criteriaList}

CONFORMITÉ RÉGLEMENTAIRE À VÉRIFIER :
${complianceList}

INSTRUCTIONS DE RÉPONSE :
Réponds **UNIQUEMENT** avec un objet JSON valide contenant exactement ces champs :

1. "summary" : String - Résumé global de la comparaison spécialisé ${template.name} (2-3 phrases)

2. "comparison_table" : Array d'objets comparatifs. EXEMPLE DE FORMAT :
   [
     {
       "criteria": "Nom du critère",
       "documents": [
         {"name": "Document 1", "value": "Description", "score": 4},
         {"name": "Document 2", "value": "Description", "score": 2}
       ]
     }
   ]

3. "best_practices" : Array de strings simples. EXEMPLE :
   ["Pratique 1 identifiée", "Pratique 2 identifiée", "Pratique 3 identifiée"]

4. "red_flags" : Array de strings simples. EXEMPLE :
   ["Clause problématique 1", "Clause problématique 2"]

5. "recommendations" : Array de strings simples (une recommandation par string). EXEMPLE :
   ["Document 1: Améliorer la clause X pour plus de transparence", "Document 2: Clarifier les conditions de résiliation"]

6. "overall_ranking" : Array d'objets de classement. EXEMPLE DE FORMAT :
   [
     {"name": "Document 1", "rank": 1, "justification": "Raison du classement"},
     {"name": "Document 2", "rank": 2, "justification": "Raison du classement"}
   ]

7. "compliance_analysis" : Array d'objets de conformité. EXEMPLE DE FORMAT :
   [
     {"framework": "GDPR", "status": "Conforme", "details": "Description"},
     {"framework": "Code consommation", "status": "Partiel", "details": "Description"}
   ]

8. "industry_insights" : Array de strings simples. EXEMPLE :
   ["Insight 1 spécifique au secteur", "Insight 2 spécifique au secteur"]

IMPORTANT : Retourne UNIQUEMENT du JSON valide. Tous les arrays doivent contenir des éléments du format exact spécifié ci-dessus.

Documents à analyser :
\`\`\`
${documentsText}
\`\`\`
`.trim();
};

// Templates de prompt différenciés par plan
const PLAN_ANALYSIS_TEMPLATES = {
  starter: {
    name: 'Analyse Starter',
    criteria: [
      'Clarté des conditions',
      'Facilité de résiliation',
      'Frais cachés'
    ],
    fields: 3,
    complexity: 'simple',
    description: 'Analyse basique des points essentiels'
  },
  
  standard: {
    name: 'Analyse Standard',
    criteria: [
      'Transparence des conditions',
      'Facilité de résiliation', 
      'Frais cachés',
      'Protection des données',
      'Garanties offertes',
      'Modalités de recours'
    ],
    fields: 6,
    complexity: 'standard',
    description: 'Analyse complète des critères principaux'
  },
  
  premium: {
    name: 'Analyse Premium',
    criteria: [
      'Transparence des conditions',
      'Facilité de résiliation',
      'Frais cachés', 
      'Protection des données',
      'Garanties offertes',
      'Modalités de recours',
      'Équilibre contractuel',
      'Respect du droit de la consommation',
      'Sécurité juridique',
      'Flexibilité commerciale'
    ],
    fields: 10,
    complexity: 'avancée',
    description: 'Analyse approfondie avec insights sectoriels',
    includeInsights: true
  },
  
  enterprise: {
    name: 'Analyse Enterprise',
    criteria: [
      'Transparence des conditions',
      'Facilité de résiliation',
      'Frais cachés',
      'Protection des données',
      'Garanties offertes', 
      'Modalités de recours',
      'Équilibre contractuel',
      'Respect du droit de la consommation',
      'Sécurité juridique',
      'Flexibilité commerciale',
      'Conformité réglementaire',
      'Gestion des risques',
      'Impact business',
      'Compétitivité marché'
    ],
    fields: 14,
    complexity: 'experte',
    description: 'Analyse experte avec conformité et insights business',
    includeInsights: true,
    includeCompliance: true,
    includeBusiness: true
  }
};

const generateAnalysisPrompt = (plan = 'standard', documentText) => {
  const template = PLAN_ANALYSIS_TEMPLATES[plan] || PLAN_ANALYSIS_TEMPLATES.standard;
  const criteriaList = template.criteria.map(c => `- ${c}`).join('\n');
  
  let prompt = `
Tu es un expert juridique spécialisé dans l'analyse de Conditions Générales d'Abonnement (CGA) et documents contractuels.

MISSION : Analyser le document fourni et produire une évaluation ${template.complexity} structurée et actionnable.

CRITÈRES À ANALYSER (${template.name}) :
${criteriaList}

INSTRUCTIONS DE RÉPONSE :
Réponds **UNIQUEMENT** avec un objet JSON valide contenant exactement ces champs :

1. "resume" : Un résumé en 2-3 phrases max, incluant OBLIGATOIREMENT :
   - L'essentiel du service/contrat (1 phrase)
   - La justification précise du score attribué avec les critères déterminants (1-2 phrases)

2. "score" : Une évaluation objective parmi ces 5 niveaux UNIQUEMENT :
   - "Excellent" : Document très favorable au consommateur, clauses claires, droits bien protégés
   - "Bon" : Document équilibré avec quelques points d'attention mineurs
   - "Moyen" : Document standard avec des clauses potentiellement problématiques
   - "Médiocre" : Document défavorable avec plusieurs clauses abusives ou ambiguës
   - "Problématique" : Document très défavorable, clauses potentiellement illégales

3. "clauses" : Array de ${template.fields}-${template.fields + 4} points clés maximum, OBLIGATOIREMENT classés par CRITICITÉ DÉCROISSANTE :
   - TOUJOURS commencer par les 3-4 éléments les plus critiques/problématiques (⚠️)
   - Puis les avantages significatifs (✅)
   - Enfin les points neutres/informatifs (ℹ️)`;

  // Ajouts spécifiques selon le plan
  if (template.includeInsights) {
    prompt += `\n   - Inclure des insights sectoriels pertinents`;
  }
  
  if (template.includeCompliance) {
    prompt += `\n   - Mentionner la conformité réglementaire (GDPR, Code consommation, etc.)`;
  }
  
  if (template.includeBusiness) {
    prompt += `\n   - Ajouter l'impact business et la compétitivité`;
  }

  prompt += `

FORMAT EXEMPLE pour ${template.name} :
{
  "resume": "Service d'abonnement...",
  "score": "Bon",
  "clauses": [
    "⚠️ Clause résiliation contraignante...",
    "⚠️ Frais cachés potentiels...",
    "✅ Garantie satisfait ou remboursé...",
    "ℹ️ Service client disponible..."
  ]
}

Document à analyser :
\`\`\`
${documentText}
\`\`\``;

  return prompt.trim();
};

module.exports = {
  INDUSTRY_TEMPLATES,
  PLAN_ANALYSIS_TEMPLATES,
  getAnalysisTemplate,
  generateIndustryPrompt,
  generateAnalysisPrompt,
};
