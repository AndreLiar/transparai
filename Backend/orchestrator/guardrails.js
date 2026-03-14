// Backend/orchestrator/guardrails.js
// Input + output guardrails — NIST AI RMF Measure, EU AI Act Art. 9 risk management

// ── Prompt injection detection ────────────────────────────────────────────────
// Contracts submitted by users may deliberately contain adversarial instructions
// designed to override the system prompt or extract model internals.
// We detect and neutralise these before the text reaches the LLM.
const INJECTION_PATTERNS = [
  // Direct override attempts
  /ignore\s+(all\s+)?(previous|above|prior|earlier)\s+(instructions?|prompts?|context)/i,
  /forget\s+(everything|all|your\s+instructions)/i,
  /disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?)/i,
  /override\s+(your\s+)?(instructions?|system\s+prompt|rules?)/i,

  // System prompt extraction
  /reveal\s+(your\s+)?(system\s+prompt|instructions?|rules?|prompt)/i,
  /print\s+(your\s+)?(system\s+prompt|instructions?)/i,
  /what\s+(are|is)\s+your\s+(instructions?|system\s+prompt|rules?)/i,
  /repeat\s+(your\s+)?(system\s+prompt|instructions?)/i,

  // Role/persona hijacking
  /you\s+are\s+now\s+(a\s+)?(?!a\s+legal|an?\s+AI\s+assistant)/i,
  /act\s+as\s+(?!a\s+legal|an?\s+AI)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /roleplay\s+as/i,
  /jailbreak/i,
  /DAN\s+mode/i,

  // Instruction delimiters used to hijack prompt structure
  /\[INST\]|\[\/INST\]|<\|im_start\|>|<\|im_end\|>|\[SYSTEM\]/i,

  // Attempts to end the prompt early and inject new instructions
  /```\s*\n.*?(ignore|forget|disregard|you are)/is,
];

/**
 * Detect prompt injection attempts in contract text.
 * Returns { hasInjection, patterns[] }
 */
const detectInjection = (text) => {
  const found = [];
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      found.push(pattern.source.substring(0, 60));
    }
  }
  return { hasInjection: found.length > 0, patterns: found };
};

/**
 * Neutralise detected injection patterns by replacing them with a safe marker.
 * We don't remove them entirely (that would hide evidence) — we replace with
 * a visible marker so the LLM sees it as content, not as a command.
 */
const sanitizeInjection = (text) => {
  let sanitized = text;
  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[CONTENU_NEUTRALISÉ]');
  }
  return sanitized;
};

// Minimum legal content signal — at least some of these must appear
const LEGAL_KEYWORDS = [
  'conditions', 'termes', 'contrat', 'accord', 'clause', 'article',
  'abonnement', 'service', 'résiliation', 'frais', 'garantie',
  'responsabilité', 'obligations', 'droits', 'paiement', 'durée',
  'terms', 'contract', 'agreement', 'subscription', 'termination',
];

// Signals that suggest the LLM may have hallucinated or gone off-topic
const HALLUCINATION_SIGNALS = [
  { pattern: /je ne peux pas analyser/i, label: 'refused_analysis' },
  { pattern: /en tant qu'ia,? je/i, label: 'meta_commentary' },
  { pattern: /as an ai,? i/i, label: 'meta_commentary_en' },
  { pattern: /désolé,? je ne/i, label: 'apology_refusal' },
  { pattern: /\bN\/A\b/g, label: 'na_placeholder', threshold: 3 },
  { pattern: /lorem ipsum/i, label: 'placeholder_text' },
  { pattern: /\[insert/i, label: 'template_placeholder' },
];

/**
 * Validate input before sending to LLM.
 * Returns { passed, reasons }
 */
const validateInput = (text) => {
  const reasons = [];

  if (!text || typeof text !== 'string') {
    return { passed: false, reasons: ['Input is empty or not a string'] };
  }

  const trimmed = text.trim();

  if (trimmed.length < 100) {
    reasons.push('Text too short for meaningful analysis (< 100 chars)');
  }

  if (trimmed.length > 200000) {
    // We allow this but flag it — service will truncate
    reasons.push('Text truncated to 200,000 chars');
  }

  // Check for at least minimal legal content
  const lower = trimmed.toLowerCase();
  const hasLegalContent = LEGAL_KEYWORDS.some(kw => lower.includes(kw));
  if (!hasLegalContent) {
    reasons.push('Text does not appear to contain legal/contract content');
  }

  return {
    passed: reasons.filter(r => !r.includes('truncated')).length === 0,
    reasons,
  };
};

/**
 * Validate LLM output after parsing.
 * Returns { passed, hallucinationSignals, confidenceLevel, requiresHumanReview }
 */
const validateOutput = (parsed, rawText) => {
  const hallucinationSignals = [];

  // Check raw text for hallucination patterns
  for (const signal of HALLUCINATION_SIGNALS) {
    const matches = rawText.match(signal.pattern);
    if (matches) {
      if (signal.threshold && matches.length >= signal.threshold) {
        hallucinationSignals.push(signal.label);
      } else if (!signal.threshold) {
        hallucinationSignals.push(signal.label);
      }
    }
  }

  // Sanity check on structured output
  if (parsed.clauses && parsed.clauses.length === 0) {
    hallucinationSignals.push('empty_clauses');
  }

  if (parsed.resume && parsed.resume.length < 20) {
    hallucinationSignals.push('suspiciously_short_resume');
  }

  // Confidence derived from LLM self-report + our signals
  let confidenceLevel = parsed.confidence || 'medium';
  if (hallucinationSignals.length > 0) {
    confidenceLevel = 'low';
  }

  // Require human review if confidence is low or multiple signals detected
  const requiresHumanReview = hallucinationSignals.length >= 2 || confidenceLevel === 'low';

  return {
    passed: hallucinationSignals.length === 0,
    hallucinationSignals,
    confidenceLevel,
    requiresHumanReview,
  };
};

module.exports = { validateInput, validateOutput, detectInjection, sanitizeInjection };
