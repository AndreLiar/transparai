// Backend/routes/aiSettingsRoutes.js
const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authMiddleware');
const User = require('../models/User');
const { PLAN_AI_BUDGETS } = require('../services/aiModelService');

/**
 * @swagger
 * components:
 *   schemas:
 *     AISettings:
 *       type: object
 *       properties:
 *         preferredModel:
 *           type: string
 *           enum: [auto, gpt-4-turbo, gpt-3.5-turbo, gemini]
 *           description: Preferred AI model for analysis
 *         allowPremiumAI:
 *           type: boolean
 *           description: Allow usage of premium AI models
 *         monthlyAIBudget:
 *           type: object
 *           properties:
 *             allocated:
 *               type: number
 *               description: Monthly AI budget in USD
 *             used:
 *               type: number
 *               description: Amount used this month
 *             remaining:
 *               type: number
 *               description: Remaining budget
 */

/**
 * @swagger
 * /api/ai-settings:
 *   get:
 *     summary: Get user's AI settings and usage statistics
 *     tags: [AI Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     aiSettings:
 *                       $ref: '#/components/schemas/AISettings'
 *                     aiUsageStats:
 *                       type: object
 *                     plan:
 *                       type: string
 *                     planBudget:
 *                       type: number
 */
router.get('/', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
    }

    // Calculate remaining budget
    const aiSettings = user.aiSettings || {};
    const monthlyBudget = aiSettings.monthlyAIBudget || { allocated: 0, used: 0 };
    const remaining = monthlyBudget.allocated - monthlyBudget.used;

    res.json({
      success: true,
      data: {
        aiSettings: {
          preferredModel: aiSettings.preferredModel || 'auto',
          allowPremiumAI: aiSettings.allowPremiumAI !== false,
          monthlyAIBudget: {
            ...monthlyBudget,
            remaining: Math.max(0, remaining),
          },
        },
        aiUsageStats: user.aiUsageStats || {
          totalAnalyses: 0,
          gptAnalyses: 0,
          geminiAnalyses: 0,
          totalAICost: 0,
        },
        plan: user.plan,
        planBudget: PLAN_AI_BUDGETS[user.plan] || 0,
      },
    });
  } catch (error) {
    console.error('❌ Error getting AI settings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des paramètres IA',
    });
  }
});

/**
 * @swagger
 * /api/ai-settings:
 *   put:
 *     summary: Update user's AI settings
 *     tags: [AI Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferredModel:
 *                 type: string
 *                 enum: [auto, gpt-4-turbo, gpt-3.5-turbo, gemini]
 *               allowPremiumAI:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: AI settings updated successfully
 */
router.put('/', authenticateUser, async (req, res) => {
  try {
    const { preferredModel, allowPremiumAI } = req.body;
    
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
    }

    // Validate preferredModel
    const validModels = ['auto', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gemini'];
    if (preferredModel && !validModels.includes(preferredModel)) {
      return res.status(400).json({
        success: false,
        message: 'Modèle IA invalide',
      });
    }

    // Initialize aiSettings if it doesn't exist
    if (!user.aiSettings) {
      user.aiSettings = {
        preferredModel: 'auto',
        allowPremiumAI: true,
        monthlyAIBudget: {
          allocated: PLAN_AI_BUDGETS[user.plan] || 0,
          used: 0,
          lastReset: new Date(),
        },
      };
    }

    // Update settings
    if (preferredModel !== undefined) {
      user.aiSettings.preferredModel = preferredModel;
    }
    if (allowPremiumAI !== undefined) {
      user.aiSettings.allowPremiumAI = allowPremiumAI;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Paramètres IA mis à jour avec succès',
      data: {
        preferredModel: user.aiSettings.preferredModel,
        allowPremiumAI: user.aiSettings.allowPremiumAI,
      },
    });
  } catch (error) {
    console.error('❌ Error updating AI settings:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des paramètres IA',
    });
  }
});

/**
 * @swagger
 * /api/ai-settings/usage:
 *   get:
 *     summary: Get detailed AI usage statistics
 *     tags: [AI Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI usage statistics retrieved successfully
 */
router.get('/usage', authenticateUser, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable',
      });
    }

    const stats = user.aiUsageStats || {};
    const budget = user.aiSettings?.monthlyAIBudget || { allocated: 0, used: 0 };
    
    // Calculate usage percentages
    const gptPercentage = stats.totalAnalyses > 0 
      ? ((stats.gptAnalyses || 0) / stats.totalAnalyses * 100).toFixed(1)
      : 0;
    
    const budgetPercentage = budget.allocated > 0
      ? ((budget.used / budget.allocated) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        usage: {
          totalAnalyses: stats.totalAnalyses || 0,
          gptAnalyses: stats.gptAnalyses || 0,
          geminiAnalyses: stats.geminiAnalyses || 0,
          gptPercentage: parseFloat(gptPercentage),
        },
        budget: {
          allocated: budget.allocated,
          used: budget.used,
          remaining: Math.max(0, budget.allocated - budget.used),
          percentage: parseFloat(budgetPercentage),
        },
        costs: {
          totalAICost: stats.totalAICost || 0,
          averageCostPerAnalysis: stats.totalAnalyses > 0 
            ? ((stats.totalAICost || 0) / stats.totalAnalyses).toFixed(4)
            : 0,
        },
        lastUpdated: stats.lastUpdated,
      },
    });
  } catch (error) {
    console.error('❌ Error getting AI usage:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques IA',
    });
  }
});

module.exports = router;