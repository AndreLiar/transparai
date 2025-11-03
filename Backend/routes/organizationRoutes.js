// Backend/routes/organizationRoutes.js
const express = require('express');
const {
  createOrg,
  getOrgDetails,
  updateOrgSettings,
  getOrgBilling,
  getMyOrganization,
} = require('../controllers/organizationController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Enterprise organization management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           example: "Acme Corporation"
 *         domain:
 *           type: string
 *           example: "acme.com"
 *         settings:
 *           type: object
 *           properties:
 *             branding:
 *               type: object
 *               properties:
 *                 logo:
 *                   type: string
 *                   example: "https://cdn.acme.com/logo.png"
 *                 primaryColor:
 *                   type: string
 *                   example: "#4f46e5"
 *                 customDomain:
 *                   type: string
 *                   example: "analytics.acme.com"
 *             security:
 *               type: object
 *               properties:
 *                 requireEmailVerification:
 *                   type: boolean
 *                   example: true
 *                 sessionTimeout:
 *                   type: number
 *                   example: 3600
 *                 allowedDomains:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["acme.com", "partners.acme.com"]
 *         billing:
 *           type: object
 *           properties:
 *             plan:
 *               type: string
 *               enum: [enterprise]
 *               example: "enterprise"
 *             maxUsers:
 *               type: number
 *               example: 100
 *             stripeCustomerId:
 *               type: string
 *               example: "cus_1234567890"
 *         usage:
 *           type: object
 *           properties:
 *             currentUsers:
 *               type: number
 *               example: 25
 *             monthlyAnalyses:
 *               type: number
 *               example: 1250
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-10-11T10:30:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-10-11T15:45:00Z"
 */

/**
 * @swagger
 * /api/organization/my-organization:
 *   get:
 *     summary: Get current user's organization
 *     description: |
 *       Retrieves the organization that the authenticated user belongs to.
 *       Returns null if user is not part of any organization.
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Organization retrieved successfully (or null if not found)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 organization:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/Organization'
 *                     - type: 'null'
 *                 userRole:
 *                   type: string
 *                   enum: [admin, manager, analyst, viewer]
 *                   example: "admin"
 *                   description: "User's role in the organization"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get user's organization
router.get('/my-organization', authenticateToken, getMyOrganization);

/**
 * @swagger
 * /api/organization/create:
 *   post:
 *     summary: Create new organization
 *     description: |
 *       Creates a new organization and sets the creator as admin.
 *       Only available for Enterprise plan users.
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corporation"
 *                 description: "Organization name"
 *               domain:
 *                 type: string
 *                 example: "acme.com"
 *                 description: "Company domain (optional)"
 *               industry:
 *                 type: string
 *                 example: "Technology"
 *                 description: "Industry type (optional)"
 *               settings:
 *                 type: object
 *                 description: "Initial organization settings (optional)"
 *                 properties:
 *                   branding:
 *                     type: object
 *                     properties:
 *                       primaryColor:
 *                         type: string
 *                         example: "#4f46e5"
 *             required: [name]
 *           example:
 *             name: "Acme Corporation"
 *             domain: "acme.com"
 *             industry: "Technology"
 *     responses:
 *       201:
 *         description: Organization created successfully
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
 *                   example: "Organisation créée avec succès"
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *                 userRole:
 *                   type: string
 *                   example: "admin"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User already belongs to an organization or insufficient plan
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Vous appartenez déjà à une organisation"
 *                 code: "ALREADY_IN_ORGANIZATION"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Create new organization
router.post('/create', authenticateToken, createOrg);

/**
 * @swagger
 * /api/organization/{organizationId}:
 *   get:
 *     summary: Get organization details
 *     description: |
 *       Retrieves detailed information about a specific organization.
 *       User must be a member of the organization to access this data.
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *         description: "Organization ID"
 *     responses:
 *       200:
 *         description: Organization details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "RywcCYBykQdHjYRydqMWv2pLeyw1"
 *                       email:
 *                         type: string
 *                         example: "user@acme.com"
 *                       profile:
 *                         type: object
 *                         properties:
 *                           firstName:
 *                             type: string
 *                             example: "John"
 *                           lastName:
 *                             type: string
 *                             example: "Doe"
 *                       role:
 *                         type: string
 *                         enum: [admin, manager, analyst, viewer]
 *                         example: "analyst"
 *                       joinedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-10-01T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: User not authorized to access this organization
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Accès non autorisé à cette organisation"
 *                 code: "ORGANIZATION_ACCESS_DENIED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       404:
 *         description: Organization not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Organisation introuvable"
 *                 code: "ORGANIZATION_NOT_FOUND"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get organization details
router.get('/:organizationId', authenticateToken, getOrgDetails);

/**
 * @swagger
 * /api/organization/{organizationId}/settings:
 *   put:
 *     summary: Update organization settings
 *     description: |
 *       Updates organization settings including branding, security policies,
 *       and feature configurations. Requires admin permissions.
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Acme Corporation Ltd"
 *               branding:
 *                 type: object
 *                 properties:
 *                   logo:
 *                     type: string
 *                     example: "https://cdn.acme.com/logo.png"
 *                   primaryColor:
 *                     type: string
 *                     example: "#4f46e5"
 *                   customDomain:
 *                     type: string
 *                     example: "analytics.acme.com"
 *               security:
 *                 type: object
 *                 properties:
 *                   requireEmailVerification:
 *                     type: boolean
 *                     example: true
 *                   sessionTimeout:
 *                     type: number
 *                     example: 3600
 *                   allowedDomains:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["acme.com", "partners.acme.com"]
 *               features:
 *                 type: object
 *                 properties:
 *                   enableComparativeAnalysis:
 *                     type: boolean
 *                     example: true
 *                   enableAdvancedAnalytics:
 *                     type: boolean
 *                     example: true
 *           example:
 *             name: "Acme Corporation Ltd"
 *             branding:
 *               primaryColor: "#4f46e5"
 *               logo: "https://cdn.acme.com/new-logo.png"
 *             security:
 *               requireEmailVerification: true
 *               sessionTimeout: 7200
 *     responses:
 *       200:
 *         description: Organization settings updated successfully
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
 *                   example: "Paramètres de l'organisation mis à jour avec succès"
 *                 organization:
 *                   $ref: '#/components/schemas/Organization'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Insufficient permissions (admin required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Seuls les administrateurs peuvent modifier les paramètres"
 *                 code: "ADMIN_REQUIRED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Update organization settings
router.put('/:organizationId/settings', authenticateToken, updateOrgSettings);

/**
 * @swagger
 * /api/organization/{organizationId}/billing:
 *   get:
 *     summary: Get organization billing information
 *     description: |
 *       Retrieves billing details, subscription status, usage metrics,
 *       and payment history. Requires admin or manager permissions.
 *     tags: [Organizations]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Billing information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 billing:
 *                   type: object
 *                   properties:
 *                     plan:
 *                       type: string
 *                       example: "enterprise"
 *                     status:
 *                       type: string
 *                       enum: [active, past_due, cancelled, trialing]
 *                       example: "active"
 *                     maxUsers:
 *                       type: number
 *                       example: 100
 *                     currentUsers:
 *                       type: number
 *                       example: 25
 *                     monthlyPrice:
 *                       type: number
 *                       example: 2999
 *                       description: "Price in cents"
 *                     nextBillingDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-11-11"
 *                     stripeCustomerId:
 *                       type: string
 *                       example: "cus_1234567890"
 *                 usage:
 *                   type: object
 *                   properties:
 *                     currentPeriod:
 *                       type: object
 *                       properties:
 *                         analyses:
 *                           type: number
 *                           example: 1250
 *                         comparativeAnalyses:
 *                           type: number
 *                           example: 45
 *                         exportedReports:
 *                           type: number
 *                           example: 78
 *                     historical:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-09"
 *                           analyses:
 *                             type: number
 *                             example: 980
 *                 invoices:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "in_1234567890"
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2024-10-01"
 *                       amount:
 *                         type: number
 *                         example: 2999
 *                       status:
 *                         type: string
 *                         enum: [paid, pending, failed]
 *                         example: "paid"
 *                       downloadUrl:
 *                         type: string
 *                         example: "https://invoice.stripe.com/..."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: Insufficient permissions (admin/manager required)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               error:
 *                 message: "Accès aux informations de facturation non autorisé"
 *                 code: "BILLING_ACCESS_DENIED"
 *                 timestamp: "2024-10-11T10:30:00Z"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Get organization billing
router.get('/:organizationId/billing', authenticateToken, getOrgBilling);

// Send invitation
router.post('/:organizationId/invite', authenticateToken, async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { email, role, message } = req.body;
    const { uid } = req.user;

    // Import modules
    const Organization = require('../models/Organization');
    const User = require('../models/User');
    const Invitation = require('../models/Invitation');
    const { sendInvitationEmail } = require('../services/emailService');
    const crypto = require('crypto');

    // Basic validation
    if (!email || !role) {
      return res.status(400).json({ message: 'Email et rôle requis.' });
    }

    // Validate role
    if (!['admin', 'manager', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide.' });
    }

    // Get inviter user and organization
    const inviterUser = await User.findOne({ firebaseUid: uid });
    const organization = await Organization.findById(organizationId);

    if (!inviterUser || !organization) {
      return res.status(404).json({ message: 'Utilisateur ou organisation introuvable.' });
    }

    // Check if inviter has permission (admin or manager)
    if (!['admin', 'manager'].includes(inviterUser.organization?.role)) {
      return res.status(403).json({ message: 'Accès non autorisé. Seuls les admins et managers peuvent envoyer des invitations.' });
    }

    // Check if user is already in organization
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      'organization.id': organizationId,
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Cet utilisateur fait déjà partie de l\'organisation.' });
    }

    // Check if there's already a pending invitation
    const existingInvitation = await Invitation.findOne({
      email: email.toLowerCase(),
      organizationId,
      status: 'pending',
    });

    if (existingInvitation && !existingInvitation.isExpired()) {
      return res.status(400).json({ message: 'Une invitation est déjà en attente pour cette adresse email.' });
    }

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new Invitation({
      email: email.toLowerCase(),
      organizationId,
      invitedBy: inviterUser._id,
      role,
      token,
      customMessage: message || '',
    });

    await invitation.save();

    // Send email
    try {
      await sendInvitationEmail({
        email: email.toLowerCase(),
        organizationName: organization.name,
        inviterName: `${inviterUser.profile?.firstName} ${inviterUser.profile?.lastName}`.trim() || inviterUser.email,
        role,
        customMessage: message,
        invitationToken: token,
      });

      // Mark email as sent
      invitation.emailSent = true;
      invitation.emailSentAt = new Date();
      await invitation.save();

      console.log(`✅ Invitation envoyée à ${email} pour l'organisation ${organization.name}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // Delete invitation if email failed
      await Invitation.findByIdAndDelete(invitation._id);
      return res.status(500).json({ message: 'Erreur lors de l\'envoi de l\'email d\'invitation.' });
    }

    res.json({
      message: 'Invitation envoyée avec succès',
      invitation: {
        id: invitation._id,
        email: invitation.email,
        role: invitation.role,
        organizationName: organization.name,
        sentAt: invitation.createdAt,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (err) {
    console.error('❌ Erreur envoi invitation :', err.message);
    res.status(500).json({ message: err.message || 'Erreur lors de l\'envoi de l\'invitation.' });
  }
});

// Accept invitation
router.post('/accept-invitation', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;
    const { uid } = req.user;

    // Import modules
    const Organization = require('../models/Organization');
    const User = require('../models/User');
    const Invitation = require('../models/Invitation');

    if (!token) {
      return res.status(400).json({ message: 'Token d\'invitation requis.' });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ token })
      .populate('organizationId')
      .populate('invitedBy', 'profile email');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation introuvable.' });
    }

    // Check if invitation is expired
    if (invitation.isExpired() || invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Cette invitation a expiré ou n\'est plus valide.' });
    }

    // Get the user
    const user = await User.findOne({ firebaseUid: uid });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    // Check if user email matches invitation email
    if (user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      return res.status(400).json({
        message: 'Cette invitation n\'est pas destinée à votre adresse email.',
      });
    }

    // Check if user is already in an organization
    if (user.organization && user.organization.id) {
      return res.status(400).json({
        message: 'Vous faites déjà partie d\'une organisation.',
      });
    }

    // Update user with organization info
    await User.findOneAndUpdate(
      { firebaseUid: uid },
      {
        plan: 'enterprise',
        organization: {
          id: invitation.organizationId._id,
          role: invitation.role,
          joinedAt: new Date(),
        },
      },
    );

    // Update organization user count
    await Organization.findByIdAndUpdate(
      invitation.organizationId._id,
      { $inc: { 'usage.currentUsers': 1 } },
    );

    // Mark invitation as accepted
    invitation.status = 'accepted';
    invitation.acceptedAt = new Date();
    await invitation.save();

    console.log(`✅ Invitation acceptée: ${user.email} a rejoint ${invitation.organizationId.name}`);

    res.json({
      message: 'Invitation acceptée avec succès',
      organization: {
        id: invitation.organizationId._id,
        name: invitation.organizationId.name,
        role: invitation.role,
      },
    });
  } catch (err) {
    console.error('❌ Erreur acceptation invitation :', err.message);
    res.status(500).json({ message: err.message || 'Erreur lors de l\'acceptation de l\'invitation.' });
  }
});

// Get invitation details (for pre-filling signup form)
router.get('/invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const Invitation = require('../models/Invitation');

    if (!token) {
      return res.status(400).json({ message: 'Token d\'invitation requis.' });
    }

    // Find invitation
    const invitation = await Invitation.findOne({ token })
      .populate('organizationId', 'name')
      .populate('invitedBy', 'profile email');

    if (!invitation) {
      return res.status(404).json({ message: 'Invitation introuvable.' });
    }

    // Check if invitation is expired
    if (invitation.isExpired() || invitation.status !== 'pending') {
      return res.status(400).json({ message: 'Cette invitation a expiré ou n\'est plus valide.' });
    }

    // Return safe invitation details (no sensitive info)
    res.json({
      email: invitation.email,
      organizationName: invitation.organizationId.name,
      role: invitation.role,
      inviterName: `${invitation.invitedBy?.profile?.firstName} ${invitation.invitedBy?.profile?.lastName}`.trim() || invitation.invitedBy?.email,
      customMessage: invitation.customMessage,
      expiresAt: invitation.expiresAt,
    });
  } catch (err) {
    console.error('❌ Erreur détails invitation :', err.message);
    res.status(500).json({ message: err.message || 'Erreur lors de la récupération des détails de l\'invitation.' });
  }
});

module.exports = router;
