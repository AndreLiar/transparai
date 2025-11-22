// Backend/middleware/contentQualityValidator.js
const logger = require('../utils/logger');

// Configuration
const PLAN_LIMITS = {
  free: {
    maxLength: 50000, // 50KB
    minUniqueWords: 10, // Minimum unique words
    maxRepetition: 0.7, // Max 70% repeated content
  },
  starter: {
    maxLength: 100000, // 100KB
    minUniqueWords: 15,
    maxRepetition: 0.75,
  },
  standard: {
    maxLength: 150000, // 150KB
    minUniqueWords: 20,
    maxRepetition: 0.8,
  },
  premium: {
    maxLength: 200000, // 200KB
    minUniqueWords: 20,
    maxRepetition: 0.85,
  },
  enterprise: {
    maxLength: 500000, // 500KB
    minUniqueWords: 25,
    maxRepetition: 0.9,
  },
};

// Common gibberish patterns
const GIBBERISH_PATTERNS = [
  /lorem ipsum/gi,
  /dolor sit amet/gi,
  /consectetur adipiscing/gi,
  /^(test\s*){5,}/gi, // "test test test test test"
  /^(a\s*){10,}/gi, // "a a a a a a a a a a"
  /^(\d+\s*){20,}/gi, // "1 2 3 4 5 6 7..."
  /^([a-z]\s*){30,}/gi, // Single letter repetition
  /(.)\1{10,}/g, // Same character 10+ times
];

/**
 * Calculate text quality metrics
 */
const analyzeTextQuality = (text) => {
  if (!text || typeof text !== 'string') {
    return {
      valid: false,
      reason: 'Invalid text format',
    };
  }

  // Basic stats
  const length = text.length;
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const uniqueWords = new Set(words);
  const uniqueWordCount = uniqueWords.size;
  const totalWordCount = words.length;

  // Calculate repetition ratio
  const repetitionRatio = totalWordCount > 0
    ? 1 - (uniqueWordCount / totalWordCount)
    : 0;

  // Check for gibberish patterns
  const hasGibberish = GIBBERISH_PATTERNS.some((pattern) => pattern.test(text));

  // Calculate average word length
  const avgWordLength = words.length > 0
    ? words.reduce((sum, word) => sum + word.length, 0) / words.length
    : 0;

  // Check for excessive special characters
  const specialCharCount = (text.match(/[^a-zA-Z0-9\s]/g) || []).length;
  const specialCharRatio = length > 0 ? specialCharCount / length : 0;

  // Check for excessive whitespace
  const whitespaceCount = (text.match(/\s/g) || []).length;
  const whitespaceRatio = length > 0 ? whitespaceCount / length : 0;

  return {
    length,
    totalWordCount,
    uniqueWordCount,
    repetitionRatio,
    hasGibberish,
    avgWordLength,
    specialCharRatio,
    whitespaceRatio,
  };
};

/**
 * Validate content quality based on plan
 */
const validateContentQuality = async (req, res, next) => {
  try {
    const { text } = req.body;
    const userPlan = req.user?.plan || 'free';

    if (!text) {
      return next(); // Let other validators handle missing text
    }

    // Get plan limits
    const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.free;

    // Analyze text quality
    const quality = analyzeTextQuality(text);

    // Validate length
    if (quality.length > limits.maxLength) {
      logger.warn('Content length exceeded', {
        uid: req.user?.uid,
        plan: userPlan,
        length: quality.length,
        limit: limits.maxLength,
      });

      return res.status(400).json({
        error: `Le texte dépasse la limite de ${limits.maxLength} caractères pour votre forfait`,
        code: 'TEXT_TOO_LONG',
        details: {
          yourLength: quality.length,
          maxLength: limits.maxLength,
          plan: userPlan,
        },
      });
    }

    // Validate minimum unique words
    if (quality.uniqueWordCount < limits.minUniqueWords) {
      logger.warn('Insufficient unique words', {
        uid: req.user?.uid,
        plan: userPlan,
        uniqueWords: quality.uniqueWordCount,
        minimum: limits.minUniqueWords,
      });

      return res.status(400).json({
        error: 'Le texte ne contient pas assez de contenu unique',
        code: 'INSUFFICIENT_CONTENT',
        details: {
          uniqueWords: quality.uniqueWordCount,
          minimum: limits.minUniqueWords,
        },
      });
    }

    // Validate repetition ratio
    if (quality.repetitionRatio > limits.maxRepetition) {
      logger.warn('Excessive repetition detected', {
        uid: req.user?.uid,
        plan: userPlan,
        repetitionRatio: quality.repetitionRatio.toFixed(2),
        limit: limits.maxRepetition,
      });

      return res.status(400).json({
        error: 'Le texte contient trop de contenu répétitif',
        code: 'EXCESSIVE_REPETITION',
        details: {
          repetitionRatio: quality.repetitionRatio.toFixed(2),
          maxAllowed: limits.maxRepetition,
        },
      });
    }

    // Check for gibberish
    if (quality.hasGibberish) {
      logger.warn('Gibberish content detected', {
        uid: req.user?.uid,
        plan: userPlan,
      });

      return res.status(400).json({
        error: 'Le texte semble contenir du contenu de remplissage ou non valide',
        code: 'GIBBERISH_DETECTED',
      });
    }

    // Check for abnormal patterns
    if (quality.avgWordLength < 2 || quality.avgWordLength > 20) {
      logger.warn('Abnormal word length', {
        uid: req.user?.uid,
        avgWordLength: quality.avgWordLength.toFixed(2),
      });

      return res.status(400).json({
        error: 'Le texte ne semble pas être du contenu valide',
        code: 'INVALID_CONTENT_PATTERN',
      });
    }

    // Check for excessive special characters
    if (quality.specialCharRatio > 0.3) {
      logger.warn('Excessive special characters', {
        uid: req.user?.uid,
        ratio: quality.specialCharRatio.toFixed(2),
      });

      return res.status(400).json({
        error: 'Le texte contient trop de caractères spéciaux',
        code: 'EXCESSIVE_SPECIAL_CHARS',
      });
    }

    // Log quality metrics for monitoring
    logger.info('Content quality validated', {
      uid: req.user?.uid,
      plan: userPlan,
      length: quality.length,
      uniqueWords: quality.uniqueWordCount,
      repetitionRatio: quality.repetitionRatio.toFixed(2),
    });

    // Attach quality metrics to request for potential use in service
    req.contentQuality = quality;

    next();
  } catch (error) {
    logger.error('Content quality validation error', {
      error: error.message,
      stack: error.stack,
      uid: req.user?.uid,
    });

    // Don't block request on validation error
    next();
  }
};

/**
 * Get content quality limits for a plan
 */
const getContentLimits = (plan) => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

module.exports = {
  validateContentQuality,
  analyzeTextQuality,
  getContentLimits,
  PLAN_LIMITS,
};
