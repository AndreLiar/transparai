// Backend/services/aiModelService.js
const axios = require('axios');
const OpenAI = require('openai');

const { GEMINI_API_KEY, OPENAI_API_KEY } = process.env;

// Initialize OpenAI client (only if API key is available)
let openai = null;
if (OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: OPENAI_API_KEY,
  });
} else {
  console.warn('⚠️ OPENAI_API_KEY not found - GPT models will be unavailable');
}

// AI Model costs per 1K tokens (input + output combined estimate)
const MODEL_COSTS = {
  'gpt-4-turbo': 0.015, // $0.015 per 1K tokens
  'gpt-3.5-turbo': 0.003, // $0.003 per 1K tokens
  gemini: 0.0, // Free
};

// Plan-based AI budget allocation
const PLAN_AI_BUDGETS = {
  free: 0.0, // Free plan - no GPT budget
  starter: 0.0, // Starter plan - no GPT budget
  standard: 2.0, // $2/month GPT budget
  premium: 10.0, // $10/month GPT budget
  enterprise: 50.0, // $50/month GPT budget
};

/**
 * Analyze document complexity to determine optimal AI model
 */
const analyzeDocumentComplexity = (text) => {
  const indicators = {
    length: text.length,
    legalTerms: (text.match(/\b(whereas|hereby|thereof|pursuant|notwithstanding|indemnify|liability|breach|terminate|covenant|warranty)\b/gi) || []).length,
    sections: (text.match(/\b(article|section|clause|paragraph|subsection)\s+\d+/gi) || []).length,
    definitions: (text.match(/\b(means|defined as|shall mean|refers to)\b/gi) || []).length,
    conditionals: (text.match(/\b(if|unless|provided that|subject to|in the event)\b/gi) || []).length,
  };

  // Calculate complexity score (0-1)
  let score = 0;
  score += Math.min(indicators.length / 10000, 0.3); // Length factor
  score += Math.min(indicators.legalTerms / 20, 0.3); // Legal complexity
  score += Math.min(indicators.sections / 10, 0.2); // Structure complexity
  score += Math.min(indicators.definitions / 10, 0.1); // Definition complexity
  score += Math.min(indicators.conditionals / 15, 0.1); // Conditional complexity

  return Math.min(score, 1.0);
};

/**
 * Smart AI model selection based on user, document, and budget
 */
const selectOptimalModel = async (user, text) => {
  // Reset monthly budget if needed
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastResetMonth = user.aiSettings?.monthlyAIBudget?.lastReset
    ? `${user.aiSettings.monthlyAIBudget.lastReset.getFullYear()}-${String(user.aiSettings.monthlyAIBudget.lastReset.getMonth() + 1).padStart(2, '0')}`
    : null;

  if (currentMonth !== lastResetMonth) {
    // Reset monthly AI budget
    const allocatedBudget = PLAN_AI_BUDGETS[user.plan] || 0;
    user.aiSettings = user.aiSettings || {};
    user.aiSettings.monthlyAIBudget = {
      allocated: allocatedBudget,
      used: 0,
      lastReset: new Date(),
    };
    await user.save();
  }

  const complexity = analyzeDocumentComplexity(text);
  const aiSettings = user.aiSettings || {};
  const budget = aiSettings.monthlyAIBudget || { allocated: 0, used: 0 };
  const remainingBudget = budget.allocated - budget.used;

  // Selection logic
  const selection = {
    model: 'gemini',
    reason: 'Default fallback',
    complexity,
    remainingBudget,
    estimatedCost: 0,
  };

  // Force Gemini for free/starter plan
  if (user.plan === 'free' || user.plan === 'starter') {
    selection.reason = 'Free/Starter plan - Gemini only';
    return selection;
  }

  // Check user preference first
  if (aiSettings.preferredModel && aiSettings.preferredModel !== 'auto') {
    const preferredCost = MODEL_COSTS[aiSettings.preferredModel] || 0;
    const estimatedTokens = Math.ceil(text.length / 3); // Rough estimate
    const estimatedCost = (estimatedTokens / 1000) * preferredCost;

    if (aiSettings.preferredModel === 'gemini' || estimatedCost <= remainingBudget) {
      selection.model = aiSettings.preferredModel;
      selection.reason = 'User preference';
      selection.estimatedCost = estimatedCost;
      return selection;
    }
  }

  // Auto-selection based on complexity and budget
  const estimatedTokens = Math.ceil(text.length / 3);

  // Try GPT-4 for high complexity and premium users
  if (complexity > 0.7 && user.plan === 'premium') {
    const gpt4Cost = (estimatedTokens / 1000) * MODEL_COSTS['gpt-4-turbo'];
    if (gpt4Cost <= remainingBudget && aiSettings.allowPremiumAI !== false) {
      selection.model = 'gpt-4-turbo';
      selection.reason = 'High complexity + Premium plan';
      selection.estimatedCost = gpt4Cost;
      return selection;
    }
  }

  // Try GPT-3.5 for medium complexity
  if (complexity > 0.4) {
    const gpt35Cost = (estimatedTokens / 1000) * MODEL_COSTS['gpt-3.5-turbo'];
    if (gpt35Cost <= remainingBudget && aiSettings.allowPremiumAI !== false) {
      selection.model = 'gpt-3.5-turbo';
      selection.reason = 'Medium complexity + Budget available';
      selection.estimatedCost = gpt35Cost;
      return selection;
    }
  }

  // Fallback to Gemini
  selection.reason = complexity > 0.4 ? 'Budget exhausted - Gemini fallback' : 'Low complexity - Gemini sufficient';
  return selection;
};

/**
 * Call OpenAI GPT models
 */
const callGPTModel = async (model, prompt, maxTokens = 2048) => {
  if (!openai) {
    return {
      success: false,
      error: 'OpenAI API key not configured',
      model,
    };
  }

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a legal document analysis expert. Always respond with valid JSON format as requested.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: maxTokens,
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    return {
      success: true,
      response: completion.choices[0].message.content,
      usage: completion.usage,
      model: completion.model,
    };
  } catch (error) {
    console.error(`❌ GPT ${model} Error:`, error.message);
    return {
      success: false,
      error: error.message,
      model,
    };
  }
};

/**
 * Call Gemini model
 */
const callGeminiModel = async (prompt) => {
  try {
    const model = 'gemini-2.0-flash';
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

    const completion = await axios.post(API_URL, {
      contents: [{
        role: 'user',
        parts: [{
          text: prompt,
        }],
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        topP: 0.7,
      },
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });

    return {
      success: true,
      response: completion.data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model: 'gemini-2.0-flash',
    };
  } catch (error) {
    console.error('❌ Gemini Error:', error.message);
    return {
      success: false,
      error: error.message,
      model: 'gemini-2.0-flash',
    };
  }
};

/**
 * Smart AI analysis with fallback chain
 */
const performSmartAnalysis = async (user, text, prompt) => {
  const selection = await selectOptimalModel(user, text);
  const fallbackChain = [];

  console.log(`🤖 Selected Model: ${selection.model} (${selection.reason})`);
  console.log(`📊 Complexity: ${(selection.complexity * 100).toFixed(1)}%`);
  console.log(`💰 Estimated Cost: $${selection.estimatedCost.toFixed(4)}`);

  // Primary attempt
  let result;
  if (selection.model.startsWith('gpt')) {
    result = await callGPTModel(selection.model, prompt);
    fallbackChain.push({ model: selection.model, success: result.success });
  } else {
    result = await callGeminiModel(prompt);
    fallbackChain.push({ model: selection.model, success: result.success });
  }

  // Fallback chain if primary fails
  if (!result.success) {
    console.log(`⚠️ ${selection.model} failed, trying fallbacks...`);

    // Try GPT-3.5 if we haven't tried it and budget allows
    if (selection.model !== 'gpt-3.5-turbo' && selection.remainingBudget > 0.01) {
      console.log('🔄 Fallback: GPT-3.5 Turbo');
      result = await callGPTModel('gpt-3.5-turbo', prompt);
      fallbackChain.push({ model: 'gpt-3.5-turbo', success: result.success });
    }

    // Final fallback to Gemini
    if (!result.success && selection.model !== 'gemini') {
      console.log('🔄 Final Fallback: Gemini');
      result = await callGeminiModel(prompt);
      fallbackChain.push({ model: 'gemini', success: result.success });
    }
  }

  if (!result.success) {
    throw new Error('All AI models failed. Please try again later.');
  }

  // Update usage statistics
  const actualCost = result.usage
    ? ((result.usage.prompt_tokens + result.usage.completion_tokens) / 1000) * (MODEL_COSTS[result.model] || 0)
    : selection.estimatedCost;

  // Update user AI stats
  user.aiUsageStats = user.aiUsageStats || {
    totalAnalyses: 0,
    gptAnalyses: 0,
    geminiAnalyses: 0,
    totalAICost: 0,
  };

  user.aiUsageStats.totalAnalyses += 1;
  if (result.model.startsWith('gpt')) {
    user.aiUsageStats.gptAnalyses += 1;
    user.aiSettings.monthlyAIBudget.used += actualCost;
  } else {
    user.aiUsageStats.geminiAnalyses += 1;
  }
  user.aiUsageStats.totalAICost += actualCost;
  user.aiUsageStats.lastUpdated = new Date();

  await user.save();

  return {
    ...result,
    actualCost,
    selection,
    fallbackChain,
  };
};

module.exports = {
  selectOptimalModel,
  performSmartAnalysis,
  analyzeDocumentComplexity,
  MODEL_COSTS,
  PLAN_AI_BUDGETS,
};
