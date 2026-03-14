// Backend/orchestrator/piiRedactor.js
// PII redaction — strip personal data from contract text before sending to LLM.
//
// Contracts may contain names, emails, phone numbers, addresses, IBANs, and
// payment card numbers filled in by users or embedded in the original PDF.
// Sending this to a third-party LLM API would be a GDPR Art. 5(1)(c) violation
// (data minimisation). We redact before the text reaches the prompt.
//
// Strategy: regex replacement with type-tagged placeholders so the LLM still
// understands the clause structure — e.g. [EMAIL] [TÉLÉPHONE] [IBAN]
// Redaction is deterministic and reversible in audit logs (we store inputHash,
// not the raw text, so we never need to un-redact).
//
// Detection coverage:
//   ✓ Email addresses
//   ✓ French mobile / landline phone numbers
//   ✓ International IBAN (FR + EU common formats)
//   ✓ Payment card numbers (Visa/MC/Amex/CB — 13–19 digits with optional spaces/dashes)
//   ✓ French postal addresses (street + postcode + city)
//   ✓ French postcodes (standalone)
//   ✓ Common name-in-context patterns (M. / Mme / Mr followed by capitalised words)

// ── PII patterns ──────────────────────────────────────────────────────────────

const PII_RULES = [
  // Email — must run before URL-like patterns
  {
    label: 'EMAIL',
    pattern: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,
    placeholder: '[EMAIL]',
  },

  // Payment card — 13–19 digits, optional spaces/dashes (Luhn-like groupings)
  // Run BEFORE phone to avoid partial matches on digit strings
  {
    label: 'CARTE_PAIEMENT',
    pattern: /\b(?:\d[ \-]?){13,18}\d\b/g,
    placeholder: '[CARTE_PAIEMENT]',
  },

  // IBAN — FR + major EU formats (15–34 chars, starts with 2-letter country code)
  {
    label: 'IBAN',
    pattern: /\b[A-Z]{2}\d{2}[ ]?(?:[A-Z0-9]{4}[ ]?){2,8}[A-Z0-9]{1,4}\b/g,
    placeholder: '[IBAN]',
  },

  // French mobile: 06/07 XXXXXXXX (various spacing)
  {
    label: 'TÉLÉPHONE',
    pattern: /\b0[67](?:[ .\-]?\d{2}){4}\b/g,
    placeholder: '[TÉLÉPHONE]',
  },

  // French landline: 01-05, 08, 09 — 10 digits with optional separators
  {
    label: 'TÉLÉPHONE',
    pattern: /\b0[1-589](?:[ .\-]?\d{2}){4}\b/g,
    placeholder: '[TÉLÉPHONE]',
  },

  // International phone: +33, +1, +44, etc.
  {
    label: 'TÉLÉPHONE',
    pattern: /\+\d{1,3}[ .\-]?\(?\d{1,4}\)?(?:[ .\-]?\d{2,4}){2,4}/g,
    placeholder: '[TÉLÉPHONE]',
  },

  // French postal address: number + street type + street name + postcode + city
  // e.g. "12 rue de la Paix, 75001 Paris"
  {
    label: 'ADRESSE',
    pattern: /\b\d{1,4}[,]?\s+(?:rue|avenue|boulevard|bd|av|allée|impasse|place|chemin|voie|route|passage|cour|villa|domaine|hameau|lieu-dit)\b[^,\n]{3,50},?\s*\d{5}\s+[A-ZÀÂÉÈÊËÎÏÔÙÛÜŸŒÆ][a-zàâéèêëîïôùûüÿœæ\-' ]{2,30}/gi,
    placeholder: '[ADRESSE]',
  },

  // Standalone French postcode (5 digits, not part of a phone or card)
  {
    label: 'CODE_POSTAL',
    pattern: /(?<!\d)\b(?:0[1-9]|[1-8]\d|9[0-5])\d{3}\b(?!\d)/g,
    placeholder: '[CODE_POSTAL]',
  },

  // Name in context — "M. Jean Dupont", "Mme Marie Martin", "Mr. John Smith"
  // Only match when preceded by a salutation to avoid false-positives on company names
  {
    label: 'NOM',
    pattern: /\b(?:M\.|Mme\.?|Mme|Mr\.?|Monsieur|Madame|Dr\.?|Me\.?)\s+[A-ZÀÂÉÈÊËÎÏÔÙÛÜŸŒÆ][a-zàâéèêëîïôùûüÿœæ\-']{1,20}(?:\s+[A-ZÀÂÉÈÊËÎÏÔÙÛÜŸŒÆ][a-zàâéèêëîïôùûüÿœæ\-']{1,20}){0,2}/g,
    placeholder: '[NOM]',
  },
];

/**
 * Redact PII from contract text before sending to LLM.
 *
 * Returns:
 *   { redactedText, redactionCount, typesFound }
 *
 * - redactedText:    text with PII replaced by typed placeholders
 * - redactionCount:  total number of replacements made
 * - typesFound:      sorted list of PII types detected (for audit log)
 */
const redactPII = (text) => {
  let redacted = text;
  let redactionCount = 0;
  const typesFound = new Set();

  for (const rule of PII_RULES) {
    // Reset lastIndex for global regexes
    rule.pattern.lastIndex = 0;

    const before = redacted;
    redacted = redacted.replace(rule.pattern, (match) => {
      // Skip very short matches that are likely false positives
      if (match.trim().length < 4) return match;
      typesFound.add(rule.label);
      return rule.placeholder;
    });

    // Count how many substitutions were made for this rule
    if (redacted !== before) {
      // Count occurrences of placeholder added in this pass
      const occurrences = (redacted.match(new RegExp(rule.placeholder.replace(/[\[\]]/g, '\\$&'), 'g')) || []).length;
      const prevOccurrences = (before.match(new RegExp(rule.placeholder.replace(/[\[\]]/g, '\\$&'), 'g')) || []).length;
      redactionCount += Math.max(0, occurrences - prevOccurrences);
    }
  }

  return {
    redactedText: redacted,
    redactionCount,
    typesFound: [...typesFound].sort(),
  };
};

module.exports = { redactPII };
