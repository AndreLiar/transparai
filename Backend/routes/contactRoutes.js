// Backend/routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { sendContactEmail, testEmailConnection } = require('../services/contactEmailService');
const logger = require('../utils/logger');

/**
 * @swagger
 * /api/contact/send:
 *   post:
 *     summary: Send contact form email
 *     description: Handles contact form submissions and sends emails
 *     tags: [Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - subject
 *               - message
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jean Dupont"
 *                 description: Full name of the sender
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "jean.dupont@example.com"
 *                 description: Email address of the sender
 *               subject:
 *                 type: string
 *                 example: "support"
 *                 enum: ["support", "billing", "feature", "partnership", "data", "other"]
 *                 description: Category of the inquiry
 *               message:
 *                 type: string
 *                 example: "I need help with my account settings."
 *                 description: The message content
 *     responses:
 *       200:
 *         description: Email sent successfully
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
 *                   example: "Message envoyé avec succès"
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Tous les champs sont requis"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Erreur lors de l'envoi du message"
 */
router.post('/send', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs sont requis'
      });
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Adresse email invalide'
      });
    }
    
    // Length validation
    if (name.length > 100 || subject.length > 200 || message.length > 2000) {
      return res.status(400).json({
        success: false,
        message: 'Un ou plusieurs champs dépassent la taille autorisée'
      });
    }
    
    // Sanitize inputs (basic protection)
    const sanitizedData = {
      name: name.trim().replace(/<[^>]*>/g, ''), // Remove HTML tags
      email: email.trim().toLowerCase(),
      subject: subject.trim().replace(/<[^>]*>/g, ''),
      message: message.trim().replace(/<[^>]*>/g, '')
    };
    
    // Send email
    await sendContactEmail(sanitizedData);
    
    logger.info('Contact form submitted successfully', {
      name: sanitizedData.name,
      email: sanitizedData.email,
      subject: sanitizedData.subject
    });
    
    res.json({
      success: true,
      message: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.'
    });
    
  } catch (error) {
    logger.error('Contact form submission failed', {
      error: error.message,
      stack: error.stack
    });
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'envoi du message. Veuillez réessayer ou nous contacter directement.'
    });
  }
});

/**
 * @swagger
 * /api/contact/test:
 *   get:
 *     summary: Test email connection
 *     description: Tests the Gmail SMTP connection
 *     tags: [Contact]
 *     responses:
 *       200:
 *         description: Email connection is working
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
 *                   example: "Email connection verified"
 *       500:
 *         description: Email connection failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Email connection failed"
 */
router.get('/test', async (req, res) => {
  try {
    const result = await testEmailConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;