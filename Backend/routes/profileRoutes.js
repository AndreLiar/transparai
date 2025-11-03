// Backend/routes/profileRoutes.js
const express = require('express');
const { getProfile, updateProfile } = require('../controllers/profileController');
const authenticate = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Profile
 *   description: User profile management endpoints
 */

// Toutes les routes profil nécessitent une authentification
router.use(authenticate);

/**
 * @swagger
 * /api/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 profile:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "John"
 *                     lastName:
 *                       type: string
 *                       example: "Doe"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.doe@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+33612345678"
 *                     country:
 *                       type: string
 *                       example: "France"
 *                     plan:
 *                       type: string
 *                       enum: [starter, standard, premium, enterprise]
 *                       example: "premium"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *                 description: "User's first name"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *                 description: "User's last name"
 *               phone:
 *                 type: string
 *                 example: "+33612345678"
 *                 description: "User's phone number"
 *               country:
 *                 type: string
 *                 example: "France"
 *                 description: "User's country"
 *             required: [firstName, lastName]
 *           example:
 *             firstName: "Jane"
 *             lastName: "Smith"
 *             phone: "+33687654321"
 *             country: "France"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profil mis à jour avec succès"
 *                 profile:
 *                   type: object
 *                   properties:
 *                     firstName:
 *                       type: string
 *                       example: "Jane"
 *                     lastName:
 *                       type: string
 *                       example: "Smith"
 *                     phone:
 *                       type: string
 *                       example: "+33687654321"
 *                     country:
 *                       type: string
 *                       example: "France"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

// GET /api/profile - Récupérer le profil utilisateur
router.get('/', getProfile);

// PUT /api/profile - Mettre à jour le profil utilisateur
router.put('/', updateProfile);

module.exports = router;
