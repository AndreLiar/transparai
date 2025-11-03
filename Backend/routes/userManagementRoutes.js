// Backend/routes/userManagementRoutes.js
const express = require('express');
const {
  invite,
  acceptInvite,
  changeRole,
  removeUserFromOrg,
  getAuditHistory,
  getPendingInvitations,
  cancelInvitation,
} = require('../controllers/userManagementController');
const authenticateToken = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User Management
 *   description: Enterprise user management and role-based access control
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Invitation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         email:
 *           type: string
 *           format: email
 *           example: "newuser@company.com"
 *         role:
 *           type: string
 *           enum: [admin, manager, analyst, viewer]
 *           example: "analyst"
 *         status:
 *           type: string
 *           enum: [pending, accepted, expired, cancelled]
 *           example: "pending"
 *         invitedBy:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "admin@company.com"
 *             profile:
 *               type: object
 *               properties:
 *                 firstName:
 *                   type: string
 *                   example: "John"
 *                 lastName:
 *                   type: string
 *                   example: "Admin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-10-11T10:30:00Z"
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           example: "2024-10-18T10:30:00Z"
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         action:
 *           type: string
 *           enum: [user_invited, user_role_changed, user_removed, user_joined]
 *           example: "user_invited"
 *         userId:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               example: "admin@company.com"
 *             profile:
 *               type: object
 *         details:
 *           type: object
 *           example:
 *             invitedEmail: "newuser@company.com"
 *             role: "analyst"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-10-11T10:30:00Z"
 */

/**
 * @swagger
 * /api/user-management/accept-invitation:
 *   post:
 *     summary: Accept organization invitation
 *     description: |
 *       Accepts an invitation to join an organization. The user must be authenticated
 *       and the invitation token must be valid and not expired.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *                 description: "Invitation token received via email"
 *             required: [token]
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
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
 *                   example: "Invitation acceptée avec succès."
 *                 organization:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Acme Corporation"
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                 role:
 *                   type: string
 *                   enum: [admin, manager, analyst, viewer]
 *                   example: "analyst"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Accept invitation (public endpoint with authentication)
router.post('/accept-invitation', authenticateToken, acceptInvite);

/**
 * @swagger
 * /api/user-management/{organizationId}/invite:
 *   post:
 *     summary: Invite user to organization
 *     description: |
 *       Invites a new user to join the organization. Requires admin or manager permissions.
 *       Sends an email invitation with a unique token.
 *     tags: [User Management]
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
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@company.com"
 *               role:
 *                 type: string
 *                 enum: [admin, manager, analyst, viewer]
 *                 example: "analyst"
 *             required: [email, role]
 *     responses:
 *       201:
 *         description: Invitation sent successfully
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
 *                   example: "Invitation envoyée avec succès."
 *                 invitation:
 *                   $ref: '#/components/schemas/Invitation'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Organization-specific user management
router.post('/:organizationId/invite', authenticateToken, invite);

/**
 * @swagger
 * /api/user-management/{organizationId}/change-role:
 *   put:
 *     summary: Change user role in organization
 *     description: |
 *       Changes a user's role within the organization. Requires admin or manager permissions.
 *       Cannot change your own role or promote users to higher roles than your own.
 *     tags: [User Management]
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
 *               targetUserId:
 *                 type: string
 *                 example: "RywcCYBykQdHjYRydqMWv2pLeyw1"
 *                 description: "Firebase UID of user to modify"
 *               newRole:
 *                 type: string
 *                 enum: [admin, manager, analyst, viewer]
 *                 example: "manager"
 *             required: [targetUserId, newRole]
 *     responses:
 *       200:
 *         description: Role changed successfully
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
 *                   example: "Rôle mis à jour avec succès."
 *                 userId:
 *                   type: string
 *                   example: "RywcCYBykQdHjYRydqMWv2pLeyw1"
 *                 oldRole:
 *                   type: string
 *                   example: "analyst"
 *                 newRole:
 *                   type: string
 *                   example: "manager"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:organizationId/change-role', authenticateToken, changeRole);

/**
 * @swagger
 * /api/user-management/{organizationId}/remove-user:
 *   delete:
 *     summary: Remove user from organization
 *     description: |
 *       Removes a user from the organization. Requires admin or manager permissions.
 *       Cannot remove yourself or users with equal/higher roles.
 *     tags: [User Management]
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
 *               targetUserId:
 *                 type: string
 *                 example: "RywcCYBykQdHjYRydqMWv2pLeyw1"
 *                 description: "Firebase UID of user to remove"
 *             required: [targetUserId]
 *     responses:
 *       200:
 *         description: User removed successfully
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
 *                   example: "Utilisateur supprimé avec succès."
 *                 userId:
 *                   type: string
 *                   example: "RywcCYBykQdHjYRydqMWv2pLeyw1"
 *                 email:
 *                   type: string
 *                   example: "removed.user@company.com"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:organizationId/remove-user', authenticateToken, removeUserFromOrg);

/**
 * @swagger
 * /api/user-management/{organizationId}/pending-invitations:
 *   get:
 *     summary: Get pending invitations
 *     description: |
 *       Retrieves all pending invitations for the organization.
 *       Requires admin or manager permissions.
 *     tags: [User Management]
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
 *         description: Pending invitations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invitations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invitation'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Invitation management
router.get('/:organizationId/pending-invitations', authenticateToken, getPendingInvitations);

/**
 * @swagger
 * /api/user-management/{organizationId}/cancel-invitation:
 *   post:
 *     summary: Cancel pending invitation
 *     description: |
 *       Cancels a pending invitation. Requires admin or manager permissions.
 *     tags: [User Management]
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
 *               invitationId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *                 description: "ID of invitation to cancel"
 *             required: [invitationId]
 *     responses:
 *       200:
 *         description: Invitation cancelled successfully
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
 *                   example: "Invitation annulée avec succès."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/:organizationId/cancel-invitation', authenticateToken, cancelInvitation);

/**
 * @swagger
 * /api/user-management/{organizationId}/audit-logs:
 *   get:
 *     summary: Get organization audit logs
 *     description: |
 *       Retrieves audit logs for organization activities. Requires admin permissions.
 *       Supports pagination and filtering by action type.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: organizationId
 *         required: true
 *         schema:
 *           type: string
 *         example: "507f1f77bcf86cd799439011"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         example: 20
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [user_invited, user_role_changed, user_removed, user_joined]
 *         example: "user_invited"
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 logs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     pages:
 *                       type: integer
 *                       example: 8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
// Audit logs
router.get('/:organizationId/audit-logs', authenticateToken, getAuditHistory);

module.exports = router;
