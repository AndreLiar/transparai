// Backend/middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uid: /^[a-zA-Z0-9_-]{1,128}$/,
  objectId: /^[0-9a-fA-F]{24}$/,
  planType: /^(free|starter|standard|premium|enterprise)$/,
  analysisSource: /^(upload|ocr|text|pdf)$/,
  fileType: /^(pdf|image|text)$/
};

// Custom sanitizers
const sanitizers = {
  // Remove HTML tags and dangerous characters
  cleanText: (value) => {
    return value
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/[<>'"&]/g, '') // Remove dangerous characters
      .trim();
  },
  
  // Sanitize for MongoDB queries
  mongoSafe: (value) => {
    if (typeof value === 'object') {
      return JSON.parse(JSON.stringify(value).replace(/\$\w+/g, ''));
    }
    return value;
  }
};

// Validation middleware factory
const validate = (validations) => {
  return async (req, res, next) => {
    console.log('🔍 Validation middleware - Request body:', JSON.stringify(req.body, null, 2));
    
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      console.log('📊 Request stats:', {
        textLength: req.body.text?.length || 0,
        source: req.body.source,
        hasDocumentName: !!req.body.documentName,
        hasFileType: !!req.body.fileType
      });
      return res.status(400).json({
        error: 'Données invalides',
        details: errors.array().map(err => ({
          field: err.path,
          message: err.msg,
          value: typeof err.value === 'string' && err.value.length > 100 ? 
            `${err.value.substring(0, 100)}... (${err.value.length} chars)` : 
            err.value
        })),
        code: 'VALIDATION_ERROR'
      });
    }

    console.log('✅ Validation passed');
    next();
  };
};

// Common validations
const commonValidations = {
  // User authentication
  userAuth: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Email invalide'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Le mot de passe doit contenir au moins 8 caractères')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre')
  ],

  // Analysis validation
  analysisData: [
    body('text')
      .isLength({ min: 10, max: 200000 })
      .withMessage('Le texte doit contenir entre 10 et 200,000 caractères')
      .customSanitizer(sanitizers.cleanText),
    body('source')
      .matches(patterns.analysisSource)
      .withMessage('Source d\'analyse invalide'),
    body('documentName')
      .optional()
      .isLength({ max: 255 })
      .customSanitizer(sanitizers.cleanText),
    body('fileType')
      .optional()
      .matches(patterns.fileType)
      .withMessage('Type de fichier invalide')
  ],

  // User ID validation
  userId: [
    param('userId')
      .matches(patterns.uid)
      .withMessage('ID utilisateur invalide')
  ],

  // Analysis ID validation
  analysisId: [
    param('analysisId')
      .matches(patterns.objectId)
      .withMessage('ID d\'analyse invalide')
  ],

  // Plan validation
  planUpdate: [
    body('plan')
      .matches(patterns.planType)
      .withMessage('Type de plan invalide')
  ],

  // Search/pagination
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Numéro de page invalide'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limite invalide'),
    query('sort')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'score', 'title'])
      .withMessage('Critère de tri invalide')
  ]
};

// Specific route validations
const routeValidations = {
  // POST /api/analyze
  analyzeContract: validate([
    ...commonValidations.analysisData
  ]),

  // GET /api/export/:analysisId
  exportAnalysis: validate([
    ...commonValidations.analysisId
  ]),

  // PUT /api/user/plan
  updatePlan: validate([
    ...commonValidations.planUpdate
  ]),

  // GET /api/user/:userId
  getUser: validate([
    ...commonValidations.userId
  ]),

  // POST /api/support
  supportTicket: validate([
    body('subject')
      .isLength({ min: 5, max: 200 })
      .withMessage('Le sujet doit contenir entre 5 et 200 caractères')
      .customSanitizer(sanitizers.cleanText),
    body('message')
      .isLength({ min: 10, max: 2000 })
      .withMessage('Le message doit contenir entre 10 et 2000 caractères')
      .customSanitizer(sanitizers.cleanText),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Priorité invalide')
  ]),

  // File upload validation
  fileUpload: validate([
    body('fileType')
      .matches(patterns.fileType)
      .withMessage('Type de fichier non supporté'),
    body('fileSize')
      .optional()
      .isInt({ min: 1, max: 10485760 }) // 10MB max
      .withMessage('Taille de fichier invalide')
  ])
};

// Advanced validation for complex objects
const validateComplexObject = (schema) => {
  return (req, res, next) => {
    try {
      const errors = [];
      
      const validateObject = (obj, schemaObj, path = '') => {
        for (const key in schemaObj) {
          const fullPath = path ? `${path}.${key}` : key;
          const value = obj[key];
          const rules = schemaObj[key];
          
          if (rules.required && (value === undefined || value === null)) {
            errors.push({ field: fullPath, message: `${key} est requis` });
            continue;
          }
          
          if (value !== undefined && value !== null) {
            if (rules.type && typeof value !== rules.type) {
              errors.push({ field: fullPath, message: `${key} doit être de type ${rules.type}` });
            }
            
            if (rules.pattern && !rules.pattern.test(value)) {
              errors.push({ field: fullPath, message: `${key} format invalide` });
            }
            
            if (rules.minLength && value.length < rules.minLength) {
              errors.push({ field: fullPath, message: `${key} trop court` });
            }
            
            if (rules.maxLength && value.length > rules.maxLength) {
              errors.push({ field: fullPath, message: `${key} trop long` });
            }
            
            if (rules.children && typeof value === 'object') {
              validateObject(value, rules.children, fullPath);
            }
          }
        }
      };
      
      validateObject(req.body, schema);
      
      if (errors.length > 0) {
        return res.status(400).json({
          error: 'Validation échouée',
          details: errors,
          code: 'COMPLEX_VALIDATION_ERROR'
        });
      }
      
      next();
    } catch (error) {
      return res.status(400).json({
        error: 'Erreur de validation',
        code: 'VALIDATION_PROCESSING_ERROR'
      });
    }
  };
};

module.exports = {
  validate,
  commonValidations,
  routeValidations,
  validateComplexObject,
  patterns,
  sanitizers
};