// Backend/routes/analyzeRoutes.js
const express = require('express');

const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const { analyzeText } = require('../controllers/analyzeController');
const { routeValidations } = require('../middleware/validation');
const { validateContentQuality } = require('../middleware/contentQualityValidator');
const {
  sanitizeInput,
  noSQLInjectionProtection,
  requestSizeLimiter,
  securityLogger,
} = require('../middleware/security');

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Document analysis endpoints
 */

/**
 * @swagger
 * /api/analyze:
 *   post:
 *     summary: Analyze Terms and Conditions document
 *     description: |
 *       Analyzes a document (text, PDF, or image) using AI to detect transparency issues,
 *       abusive clauses, and provides a transparency score from 0-100.
 *
 *       **Supported formats:**
 *       - Plain text (directly in `text` field)
 *       - PDF files (base64 encoded in `file` field)
 *       - Images (base64 encoded, will use OCR)
 *
 *       **Rate limiting:** Based on user's monthly quota (varies by plan)
 *     tags: [Analysis]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 example: "Terms of Service: By using our service you agree to..."
 *                 description: "Plain text content to analyze (use either text OR file)"
 *               file:
 *                 type: string
 *                 format: byte
 *                 description: "Base64 encoded file content (PDF or image)"
 *               fileName:
 *                 type: string
 *                 example: "terms-of-service.pdf"
 *                 description: "Original filename for reference"
 *               source:
 *                 type: string
 *                 enum: [text, pdf, ocr]
 *                 example: "pdf"
 *                 description: "Source type of the document"
 *             oneOf:
 *               - required: [text, source]
 *               - required: [file, fileName, source]
 *           examples:
 *             textAnalysis:
 *               summary: "Text analysis example"
 *               value:
 *                 text: "Terms of Service: By using our service you agree to allow us to collect your data..."
 *                 source: "text"
 *             pdfAnalysis:
 *               summary: "PDF analysis example"
 *               value:
 *                 file: "JVBERi0xLjQKJcfs..."
 *                 fileName: "terms.pdf"
 *                 source: "pdf"
 *     responses:
 *       200:
 *         description: Analysis completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 analysis:
 *                   $ref: '#/components/schemas/Analysis'
 *                 quotaRemaining:
 *                   type: number
 *                   example: 85
 *                   description: "Number of analyses remaining this month"
 *             example:
 *               success: true
 *               analysis:
 *                 id: "507f1f77bcf86cd799439011"
 *                 fileName: "terms-of-service.pdf"
 *                 source: "pdf"
 *                 score: 75
 *                 grade: "B"
 *                 summary: "The terms generally favor the company with several concerning clauses about data usage and liability limitations."
 *                 risks:
 *                   - type: "Data Collection"
 *                     severity: "High"
 *                     description: "Extensive data collection without clear opt-out mechanisms"
 *                   - type: "Liability"
 *                     severity: "Medium"
 *                     description: "Company limits liability to maximum of €100"
 *                 createdAt: "2024-10-11T10:30:00Z"
 *               quotaRemaining: 85
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       429:
 *         $ref: '#/components/responses/QuotaExceededError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post(
  '/',
  securityLogger,
  requestSizeLimiter,
  sanitizeInput,
  noSQLInjectionProtection,
  authenticate,
  routeValidations.analyzeContract,
  validateContentQuality, // Add content quality validation
  analyzeText,
);

module.exports = router;
