// Backend/orchestrator/outputParser.js
// Zod schema + structured output parsing — replaces brittle JSON.parse + regex
// Enforces contract on every LLM response

const { z } = require('zod');

// Valid score values defined once
const VALID_SCORES = ['Excellent', 'Bon', 'Moyen', 'Médiocre', 'Problématique'];
const CONFIDENCE_LEVELS = ['high', 'medium', 'low'];

// Schema for single document analysis
const singleAnalysisSchema = z.object({
  resume: z.string().min(10, 'Resume too short'),
  score: z.enum(VALID_SCORES),
  clauses: z.array(z.string()).min(1).max(20),
  confidence: z.enum(CONFIDENCE_LEVELS).default('medium'),
  jurisdiction: z.string().default('FR'),
  analysisDepth: z.string().optional(),
});

// Schema for comparative analysis
const comparativeAnalysisSchema = z.object({
  summary: z.string().min(10),
  comparison_table: z.array(z.object({
    criteria: z.string(),
    documents: z.array(z.object({
      name: z.string(),
      value: z.string(),
      score: z.number().min(0).max(5),
    })),
  })).default([]),
  best_practices: z.array(z.string()).default([]),
  red_flags: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
  overall_ranking: z.array(z.object({
    name: z.string(),
    rank: z.number(),
    justification: z.string(),
  })).default([]),
  compliance_analysis: z.array(z.object({
    framework: z.string(),
    status: z.string(),
    details: z.string(),
  })).default([]),
  industry_insights: z.array(z.string()).default([]),
  confidence: z.enum(CONFIDENCE_LEVELS).default('medium'),
});

/**
 * Extract and validate JSON from raw LLM text.
 * Handles markdown code fences and leading/trailing noise.
 */
const parseAndValidate = (rawText, schema) => {
  let cleaned = rawText.trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  // Find the outermost JSON object
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) cleaned = jsonMatch[0];

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`LLM returned invalid JSON. Raw (first 300 chars): ${rawText.substring(0, 300)}`);
  }

  const result = schema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
    throw new Error(`LLM output failed schema validation: ${issues}`);
  }

  return result.data;
};

const parseSingleAnalysis = (rawText) => parseAndValidate(rawText, singleAnalysisSchema);
const parseComparativeAnalysis = (rawText) => parseAndValidate(rawText, comparativeAnalysisSchema);

module.exports = {
  VALID_SCORES,
  CONFIDENCE_LEVELS,
  singleAnalysisSchema,
  comparativeAnalysisSchema,
  parseSingleAnalysis,
  parseComparativeAnalysis,
};
