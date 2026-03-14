// Backend/orchestrator/prompts.js
// Versioned prompt templates — ISO/IEC 42001 change management, NIST AI RMF Map
// Bump PROMPT_VERSION whenever prompt logic changes (for audit trail)

const { PromptTemplate } = require('@langchain/core/prompts');

const PROMPT_VERSION = 'v1.2';

// Disclaimer injected into every prompt — EU AI Act Art. 13
const SYSTEM_PREAMBLE = `Tu es un assistant juridique IA spécialisé dans l'analyse de contrats et Conditions Générales (CGV/CGA) pour protéger les consommateurs français et européens.

IMPORTANT — CADRE LÉGAL :
- Tu fournis une analyse informative, pas un avis juridique professionnel
- Tu opères dans le cadre du droit français et européen (RGPD, Code de la consommation, Directive 93/13/CEE sur les clauses abusives)
- Tes analyses aident les utilisateurs à identifier les risques AVANT de signer, pas à prendre des décisions légales définitives
- Juridiction par défaut : France / Union Européenne`;

// Plan-based depth configuration
const PLAN_DEPTH = {
  free: {
    clauseCount: '3 à 5',
    complexity: 'simple',
    description: 'Analyse des points essentiels',
  },
  starter: {
    clauseCount: '3 à 5',
    complexity: 'simple',
    description: 'Analyse des points essentiels',
  },
  standard: {
    clauseCount: '5 à 8',
    complexity: 'standard',
    description: 'Analyse complète des critères principaux',
  },
  premium: {
    clauseCount: '8 à 12',
    complexity: 'approfondie',
    description: 'Analyse approfondie avec insights sectoriels',
  },
  enterprise: {
    clauseCount: '10 à 14',
    complexity: 'experte',
    description: 'Analyse experte avec conformité réglementaire et impact business',
  },
};

// Single document analysis prompt
const singleAnalysisPrompt = PromptTemplate.fromTemplate(`${SYSTEM_PREAMBLE}

MISSION : Analyser le contrat fourni et produire une évaluation {complexity} pour aider l'utilisateur à comprendre les risques avant de signer.

CRITÈRES D'ANALYSE :
- Transparence des conditions
- Facilité de résiliation
- Frais cachés ou inattendus
- Protection des données personnelles
- Clauses abusives (au sens de la Directive 93/13/CEE)
- Garanties offertes au consommateur
- Modalités de recours
{extra_criteria}

RÉPONSE — format JSON strict, aucun texte en dehors du JSON :
{{
  "resume": "Résumé en 2-3 phrases incluant : nature du contrat + justification précise du score",
  "score": "UN des 5 niveaux : Excellent | Bon | Moyen | Médiocre | Problématique",
  "clauses": ["Entre {clauseCount} points, classés par criticité décroissante. Commencer par ⚠️ risques, puis ✅ avantages, puis ℹ️ informatif"],
  "confidence": "high | medium | low",
  "jurisdiction": "FR",
  "analysisDepth": "{complexity}"
}}

Scores :
- Excellent : très favorable au consommateur, droits bien protégés
- Bon : équilibré, quelques points d'attention mineurs
- Moyen : clauses potentiellement problématiques
- Médiocre : plusieurs clauses défavorables ou ambiguës
- Problématique : clauses potentiellement illégales ou très défavorables

Contrat à analyser :
\`\`\`
{document_text}
\`\`\`

Réponds UNIQUEMENT avec le JSON valide. Aucune explication en dehors du JSON.`);

// Chunk analysis prompt — used when document is split into parts
// Returns a partial result that will be merged by chunkMergePrompt
const chunkAnalysisPrompt = PromptTemplate.fromTemplate(`${SYSTEM_PREAMBLE}

MISSION : Analyser la PARTIE {chunk_index}/{chunk_total} d'un contrat plus long.
Identifie uniquement les clauses présentes dans cet extrait.
Ne génère PAS de score global — ce sera calculé après fusion de toutes les parties.

RÉPONSE — format JSON strict :
{{
  "clauses": ["Entre 3 et 8 points trouvés dans cet extrait, classés par criticité. ⚠️ risques, ✅ avantages, ℹ️ informatif"],
  "partial_summary": "1-2 phrases sur les points saillants de cet extrait uniquement",
  "confidence": "high | medium | low"
}}

Extrait {chunk_index}/{chunk_total} à analyser :
\`\`\`
{chunk_text}
\`\`\`

Réponds UNIQUEMENT avec le JSON valide.`);

// Merge prompt — combines partial chunk results into a single final analysis
const chunkMergePrompt = PromptTemplate.fromTemplate(`${SYSTEM_PREAMBLE}

MISSION : Tu reçois les résultats d'analyse de {chunk_total} parties d'un même contrat.
Synthétise-les en une analyse finale cohérente.

RÉSULTATS PARTIELS :
{partial_results}

RÉPONSE — format JSON strict (même format que l'analyse complète) :
{{
  "resume": "Résumé en 2-3 phrases : nature du contrat + justification précise du score global",
  "score": "UN des 5 niveaux : Excellent | Bon | Moyen | Médiocre | Problématique",
  "clauses": ["Entre {clause_count} points les plus importants de l'ensemble du contrat, dédoublonnés et classés par criticité décroissante"],
  "confidence": "high | medium | low",
  "jurisdiction": "FR",
  "analysisDepth": "{complexity}"
}}

Scores :
- Excellent : très favorable au consommateur, droits bien protégés
- Bon : équilibré, quelques points d'attention mineurs
- Moyen : clauses potentiellement problématiques
- Médiocre : plusieurs clauses défavorables ou ambiguës
- Problématique : clauses potentiellement illégales ou très défavorables

Réponds UNIQUEMENT avec le JSON valide.`);

// Comparative analysis prompt
const comparativeAnalysisPrompt = PromptTemplate.fromTemplate(`${SYSTEM_PREAMBLE}

MISSION : Comparer les contrats fournis pour le secteur {industry_name} et identifier lequel protège le mieux le consommateur.

CRITÈRES SPÉCIFIQUES AU SECTEUR {industry_name} :
{criteria_list}

CONFORMITÉ RÉGLEMENTAIRE À VÉRIFIER :
{compliance_list}

RÉPONSE — format JSON strict :
{{
  "summary": "Résumé comparatif global en 2-3 phrases",
  "comparison_table": [
    {{
      "criteria": "Nom du critère",
      "documents": [
        {{"name": "Nom doc", "value": "Description", "score": 4}},
        {{"name": "Nom doc", "value": "Description", "score": 2}}
      ]
    }}
  ],
  "best_practices": ["Pratique positive identifiée"],
  "red_flags": ["Clause problématique identifiée"],
  "recommendations": ["Recommandation concrète par document"],
  "overall_ranking": [
    {{"name": "Nom doc", "rank": 1, "justification": "Raison"}},
    {{"name": "Nom doc", "rank": 2, "justification": "Raison"}}
  ],
  "compliance_analysis": [
    {{"framework": "RGPD", "status": "Conforme | Partiel | Non conforme", "details": "Description"}}
  ],
  "industry_insights": ["Insight sectoriel pertinent"],
  "confidence": "high | medium | low"
}}

Documents à comparer :
\`\`\`
{documents_text}
\`\`\`

Réponds UNIQUEMENT avec le JSON valide.`);

module.exports = {
  PROMPT_VERSION,
  PLAN_DEPTH,
  singleAnalysisPrompt,
  chunkAnalysisPrompt,
  chunkMergePrompt,
  comparativeAnalysisPrompt,
};
