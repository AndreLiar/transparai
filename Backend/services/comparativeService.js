// Backend/services/comparativeService.js
const axios = require('axios');
const User = require('../models/User');
const { getAnalysisTemplate, generateIndustryPrompt } = require('../utils/analysisTemplates');
const { saveDocumentToLibrary } = require('./documentLibraryService');

const { GEMINI_API_KEY } = process.env;

// Parsing pour Analyse Comparative - Format structuré BDD (tableaux)
const parseForComparative = (rawParsed) => {
  console.log('📊 Comparative parsing: conversion vers format tableaux BDD');
  console.log('📊 Raw parsed structure:', Object.keys(rawParsed));

  // Helper pour convertir strings JSON en arrays (version très robuste)
  const ensureArray = (field, name) => {
    console.log(`🔍 ensureArray(${name}):`, typeof field, Array.isArray(field));
    console.log('🔍 Field value preview:', typeof field === 'string' ? field.substring(0, 100) : field);

    if (Array.isArray(field)) {
      console.log(`✅ ${name} est déjà un array avec ${field.length} éléments`);

      // Special handling for recommendations - extract strings if objects were returned
      if (name === 'recommendations' && field.length > 0 && typeof field[0] === 'object') {
        console.log(`🔧 ${name} array contient des objets, extraction des valeurs...`);
        const extractedStrings = field.map((item) => {
          if (item && item.value) {
            return `${item.name || 'Document'}: ${item.value}`;
          }
          return typeof item === 'string' ? item : JSON.stringify(item);
        });
        console.log(`🔧 ${name} objets array convertis en strings:`, extractedStrings);
        return extractedStrings;
      }

      return field;
    }

    // Special handling for compliance_analysis - convert object to array
    if (name === 'compliance_analysis' && typeof field === 'object' && field !== null && !Array.isArray(field)) {
      console.log(`🔧 ${name} est un objet d'input, conversion en array...`);
      const complianceArray = Object.keys(field).map((framework) => ({
        framework,
        status: 'À vérifier',
        details: field[framework] || 'Aucun détail disponible',
      }));
      console.log(`🔧 ${name} objet d'input converti en array:`, complianceArray);
      return complianceArray;
    }

    if (typeof field === 'string') {
      console.log(`🔧 String détectée pour ${name}, longueur:`, field.length);
      console.log('🔧 Contenu original:', field.substring(0, 300));

      try {
        // Étape 1: Nettoyer les caractères problématiques
        let cleanedField = field
          .replace(/\n/g, ' ') // Remplacer les retours à la ligne par des espaces
          .replace(/\r/g, ' ') // Remplacer les retours chariot
          .replace(/\t/g, ' ') // Remplacer les tabulations
          .replace(/'/g, '"') // Remplacer les apostrophes par des guillemets
          .replace(/"/g, '"') // Remplacer les guillemets courbes par droits
          .replace(/"/g, '"') // Idem pour l'autre type
          .replace(/\s+/g, ' ') // Remplacer les espaces multiples par un seul
          .trim();

        console.log(`🧹 ${name} après nettoyage de base:`, cleanedField.substring(0, 200));

        // Étape 2: Chercher un pattern d'array JSON
        let arrayMatch = null;

        // Pattern 1: Array complet [...]
        arrayMatch = cleanedField.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          console.log(`🎯 Pattern array trouvé pour ${name}:`, arrayMatch[0].substring(0, 100));
          cleanedField = arrayMatch[0];
        } else {
          // Pattern 2: Éléments séparés par des virgules sans crochets
          console.log(`🔍 Pas d'array trouvé, tentative de création d'array pour ${name}`);
          if (cleanedField.includes(',')) {
            // Séparer par virgule et nettoyer chaque élément
            const items = cleanedField.split(',').map((item) =>
              item.trim().replace(/^["']|["']$/g, ''), // Supprimer les guillemets en début/fin
            ).filter((item) => item.length > 0);

            if (items.length > 0) {
              console.log('🔨 Array créé à partir d\'éléments séparés:', items);
              return items;
            }
          } else {
            // Un seul élément, créer un array avec cet élément
            const singleItem = cleanedField.replace(/^["']|["']$/g, '').trim();
            if (singleItem.length > 0) {
              console.log('🔨 Array créé avec un seul élément:', [singleItem]);
              return [singleItem];
            }
          }
        }

        // Étape 3: Parser le JSON
        console.log(`🎯 Tentative de JSON.parse pour ${name}:`, cleanedField.substring(0, 200));
        const parsedField = JSON.parse(cleanedField);

        if (Array.isArray(parsedField)) {
          console.log(`✅ ${name} converti avec succès, ${parsedField.length} éléments`);
          console.log('✅ Premiers éléments:', parsedField.slice(0, 3));

          // Special handling for recommendations - extract strings if objects were returned
          if (name === 'recommendations' && parsedField.length > 0 && typeof parsedField[0] === 'object') {
            console.log(`🔧 ${name} contient des objets, extraction des valeurs...`);
            const extractedStrings = parsedField.map((item) => {
              if (item && item.value) {
                return `${item.name || 'Document'}: ${item.value}`;
              }
              return typeof item === 'string' ? item : JSON.stringify(item);
            });
            console.log(`🔧 ${name} objets convertis en strings:`, extractedStrings);
            return extractedStrings;
          }

          return parsedField;
        }
        console.warn(`⚠️ ${name} parsé mais pas un array:`, typeof parsedField);
        console.warn('⚠️ Contenu parsé:', parsedField);

        // Special handling for compliance_analysis - convert object to array
        if (name === 'compliance_analysis' && typeof parsedField === 'object' && parsedField !== null) {
          console.log(`🔧 ${name} est un objet, conversion en array...`);
          const complianceArray = Object.keys(parsedField).map((framework) => ({
            framework,
            status: 'À vérifier',
            details: parsedField[framework] || 'Aucun détail disponible',
          }));
          console.log(`🔧 ${name} objet converti en array:`, complianceArray);
          return complianceArray;
        }
      } catch (e) {
        console.error(`❌ JSON.parse échoué pour ${name}:`, e.message);
        console.error('❌ String problématique:', field.substring(0, 500));

        // Étape 4: Fallback - essayer de créer un array manuellement
        console.log(`🔄 Tentative de fallback pour ${name}`);
        try {
          // Chercher des éléments entre guillemets
          const quotedItems = field.match(/"([^"]+)"/g);
          if (quotedItems && quotedItems.length > 0) {
            const items = quotedItems.map((item) => item.replace(/"/g, ''));
            console.log('🔄 Fallback réussi avec éléments quotés:', items);
            return items;
          }

          // Diviser par des séparateurs communs
          const separators = [',', ';', '\n', '|'];
          for (const sep of separators) {
            if (field.includes(sep)) {
              const items = field.split(sep)
                .map((item) => item.trim().replace(/^["']|["']$/g, ''))
                .filter((item) => item.length > 10); // Filtrer les éléments trop courts

              if (items.length > 0) {
                console.log(`🔄 Fallback réussi avec séparateur '${sep}':`, items);
                return items;
              }
            }
          }
        } catch (fallbackError) {
          console.error(`❌ Fallback aussi échoué pour ${name}:`, fallbackError.message);
        }
      }
    }

    console.warn(`⚠️ ${name} devient un array vide - impossible de parser`);
    return [];
  };

  return {
    summary: rawParsed.summary || '',
    comparison_table: ensureArray(rawParsed.comparison_table, 'comparison_table'),
    best_practices: ensureArray(rawParsed.best_practices, 'best_practices'),
    red_flags: ensureArray(rawParsed.red_flags, 'red_flags'),
    recommendations: ensureArray(rawParsed.recommendations, 'recommendations'),
    overall_ranking: ensureArray(rawParsed.overall_ranking, 'overall_ranking'),
    compliance_analysis: ensureArray(rawParsed.compliance_analysis, 'compliance_analysis'),
    industry_insights: ensureArray(rawParsed.industry_insights, 'industry_insights'),
  };
};

// Note: L'analyse simple garde son parsing JSON normal dans analyzeService.js

// Document validation and preprocessing function
const validateDocuments = (documents) => {
  const errors = [];

  documents.forEach((doc, index) => {
    // Check minimum text length
    if (!doc.text || doc.text.trim().length < 100) {
      errors.push(`Document ${index + 1}: Texte trop court (minimum 100 caractères)`);
    }

    // Truncate if too long (like in analyzeService.js)
    if (doc.text && doc.text.length > 50000) {
      console.log(`⚠️ Document ${index + 1} tronqué de ${doc.text.length} à 50000 caractères`);
      doc.text = `${doc.text.substring(0, 50000)}...`;
    }

    // Check for name
    if (!doc.name || doc.name.trim().length === 0) {
      errors.push(`Document ${index + 1}: Nom requis`);
    }

    // Check for valid source
    if (!doc.source || !['upload', 'ocr'].includes(doc.source)) {
      errors.push(`Document ${index + 1}: Source invalide`);
    }

    // Check for potential legal document content
    const legalKeywords = ['conditions', 'termes', 'contrat', 'accord', 'clause', 'article', 'abonnement', 'service'];
    const hasLegalContent = legalKeywords.some((keyword) => doc.text.toLowerCase().includes(keyword));

    if (!hasLegalContent) {
      errors.push(`Document ${index + 1}: Ne semble pas être un document juridique valide`);
    }
  });

  return errors;
};

const processComparativeAnalysis = async ({ uid, documents, industry = 'default' }) => {
  const user = await User.findOne({ firebaseUid: uid });
  if (!user) throw new Error('Utilisateur introuvable');

  // Premium and Enterprise users can access comparative analysis
  if (!['premium', 'enterprise'].includes(user.plan)) {
    throw new Error('L\'analyse comparative nécessite un plan Premium ou Enterprise.');
  }

  // Enterprise-specific limits
  const maxDocuments = user.plan === 'enterprise' ? 20 : 5;
  const maxTokens = user.plan === 'enterprise' ? 8192 : 4096;
  const temperature = user.plan === 'enterprise' ? 0.1 : 0.3;

  // Reset quota if a new month has started
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastResetMonth = user.lastQuotaReset
    ? `${user.lastQuotaReset.getFullYear()}-${String(user.lastQuotaReset.getMonth() + 1).padStart(2, '0')}`
    : null;

  if (currentMonth !== lastResetMonth) {
    user.monthlyQuota.used = 0;
    user.lastQuotaReset = new Date();
  }

  await user.save();

  // Validate documents
  console.log('📊 Documents avant validation:', documents.map((d) => ({ name: d.name, textLength: d.text?.length })));
  const validationErrors = validateDocuments(documents);
  console.log('📊 Documents après validation:', documents.map((d) => ({ name: d.name, textLength: d.text?.length })));
  console.log('📊 Erreurs de validation:', validationErrors);
  if (validationErrors.length > 0) {
    throw new Error(`Erreurs de validation: ${validationErrors.join(', ')}`);
  }

  // Get industry template
  const template = getAnalysisTemplate(industry);

  // Save documents to library (with duplicate detection) - run in background
  const libraryPromises = documents.map(async (doc, index) => {
    if (doc.name && doc.text) {
      try {
        const libraryInfo = await saveDocumentToLibrary({
          uid,
          name: doc.name,
          originalName: doc.name,
          extractedText: doc.text,
          source: doc.source || 'upload',
          fileType: doc.fileType || 'unknown',
        });
        console.log(`📚 Document ${index + 1} library: ${libraryInfo.message}`);
      } catch (libError) {
        console.warn(`⚠️ Erreur sauvegarde document ${index + 1}:`, libError.message);
      }
    }
  });

  // Save all documents in parallel (don't wait, let it run in background)
  Promise.all(libraryPromises).catch((err) => console.warn('⚠️ Erreur sauvegarde bibliothèque comparative:', err.message));

  // Prepare documents text for comparison
  const documentsText = documents.map((doc, index) => `=== DOCUMENT ${index + 1}: ${doc.name || `Document ${index + 1}`} ===\n${doc.text}\n\n`).join('');

  // === Gemini AI Call ===
  const model = 'gemini-2.0-flash';
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

  let completion;
  try {
    completion = await axios.post(API_URL, {
      contents: [{
        role: 'user',
        parts: [{
          text: generateIndustryPrompt(template, documentsText),
        }],
      }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
        topP: 0.8,
      },
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 45000,
    });
  } catch (apiError) {
    console.error('❌ Erreur API Gemini:', apiError.response?.data || apiError.message);
    throw new Error(`Erreur API Gemini: ${apiError.message}`);
  }

  const raw = completion.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  let parsed;
  try {
    let cleaned = raw.trim()
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '')
      .replace(/^```\s*/, '')
      .replace(/\s*```$/, '');

    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleaned = jsonMatch[0];
    }

    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error('❌ JSON invalide:', raw.substring(0, 500));
    throw new Error('Réponse IA invalide. Veuillez réessayer.');
  }

  // Parse pour ANALYSE COMPARATIVE = toujours format structuré (tableaux)
  console.log('📊 Analyse Comparative: parsing structuré pour tableaux BDD');
  const finalParsed = parseForComparative(parsed);

  // Validation finale
  if (!finalParsed || typeof finalParsed.summary !== 'string') {
    console.error('❌ Structure JSON invalide après parsing:', finalParsed);
    throw new Error('Analyse comparative incomplète. Veuillez réessayer.');
  }

  // Add enterprise-specific fields if available
  const complianceAnalysis = finalParsed.compliance_analysis || [];
  const industryInsights = finalParsed.industry_insights || [];

  // Save comparative analysis for Premium users
  try {
    const newComparison = {
      documents: documents.map((doc) => ({ name: doc.name, source: doc.source })),
      industry,
      template: template.name,
      summary: finalParsed.summary,
      comparisonTable: finalParsed.comparison_table,
      bestPractices: finalParsed.best_practices,
      redFlags: finalParsed.red_flags,
      recommendations: finalParsed.recommendations,
      overallRanking: finalParsed.overall_ranking,
      complianceAnalysis,
      industryInsights,
      createdAt: new Date(),
    };

    if (!user.comparativeAnalyses) {
      user.comparativeAnalyses = [];
    }
    user.comparativeAnalyses.push(newComparison);

    await user.save();
  } catch (err) {
    console.error('❌ Erreur sauvegarde:', err);
    throw new Error('Erreur enregistrement analyse comparative.');
  }

  return {
    summary: finalParsed.summary,
    comparisonTable: finalParsed.comparison_table,
    bestPractices: finalParsed.best_practices,
    redFlags: finalParsed.red_flags,
    recommendations: finalParsed.recommendations,
    overallRanking: finalParsed.overall_ranking,
    complianceAnalysis,
    industryInsights,
    industry,
    template: template.name,
    analysisId: user.comparativeAnalyses[user.comparativeAnalyses.length - 1]._id,
  };
};

module.exports = { processComparativeAnalysis };
