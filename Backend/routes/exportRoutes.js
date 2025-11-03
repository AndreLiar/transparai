// routes/exportRoutes.js
const express = require('express');

const router = express.Router();
const { exportAnalysisPDF } = require('../controllers/exportController');
const authenticate = require('../middleware/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Export
 *   description: Analysis export endpoints
 */

/**
 * @swagger
 * /api/export/{analysisId}:
 *   get:
 *     summary: Export analysis as PDF
 *     description: |
 *       Exports a specific analysis as a PDF report. Available for Standard, Premium, and Enterprise users.
 *       The PDF includes the analysis score, grade, summary, detected risks, and recommendations.
 *     tags: [Export]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: analysisId
 *         required: true
 *         schema:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         description: "MongoDB ObjectId of the analysis to export"
 *     responses:
 *       200:
 *         description: PDF generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             schema:
 *               type: string
 *               example: "attachment; filename=analysis-report-507f1f77bcf86cd799439011.pdf"
 *           Content-Type:
 *             schema:
 *               type: string
 *               example: "application/pdf"
 *       400:
 *         description: Invalid analysis ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "ID d'analyse invalide"
 *                 code: "INVALID_ANALYSIS_ID"
 *                 field: "analysisId"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Export not available for current plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "L'export PDF nécessite un abonnement Standard ou supérieur"
 *                 code: "PLAN_UPGRADE_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       404:
 *         description: Analysis not found or not owned by user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Analyse introuvable"
 *                 code: "ANALYSIS_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         description: PDF generation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Erreur lors de la génération du PDF"
 *                 code: "PDF_GENERATION_ERROR"
 *                 timestamp: "2024-10-11T10:30:00Z"
 */
router.get('/:analysisId', authenticate, exportAnalysisPDF);

module.exports = router;
