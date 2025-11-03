// src/screens/Compare/Compare.tsx
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { compareDocuments, ComparativeDocument, ComparativeAnalysisResult } from '@/services/comparativeService';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import Sidebar from '@/components/Layout/Sidebar';
import './Compare.css';

// Try multiple worker paths as fallback
const initializePDFWorker = () => {
  const workerPaths = [
    '/pdfjs/pdf.worker.mjs',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
  ];
  
  // Start with local worker
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc = workerPaths[0];
  console.log('PDF.js worker initialized with:', workerPaths[0]);
};

initializePDFWorker();

type TextItem = { str: string };
type TextContent = { items: Array<TextItem | { type: string }> };

const Compare: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ComparativeDocument[]>([]);
  const [result, setResult] = useState<ComparativeAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<{[key: number]: boolean}>({});

  // Copie exacte des fonctions qui marchent dans l'analyse simple
  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let extractedText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content: TextContent = await page.getTextContent();
      const strings = content.items.filter((item): item is TextItem => 'str' in item).map(item => item.str);
      extractedText += strings.join(' ') + '\n';
    }

    return extractedText.trim();
  };

  const extractTextWithOCR = async (input: File | string): Promise<string> => {
    const { data } = await Tesseract.recognize(input, 'fra', {
      logger: m => console.log(`OCR: ${Math.round(m.progress * 100)}%`),
    });
    return data.text;
  };

  const addDocument = () => {
    if (documents.length >= 5) {
      setError('Maximum 5 documents peuvent être comparés');
      return;
    }
    setDocuments([...documents, { text: '', source: 'upload', name: `Document ${documents.length + 1}` }]);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: keyof ComparativeDocument, value: string) => {
    console.log('🔧 updateDocument appelé:', { index, field, valueLength: value.length });
    console.log('🔧 Documents avant:', documents);
    const updated = [...documents];
    updated[index] = { ...updated[index], [field]: value };
    console.log('🔧 Documents après:', updated);
    console.log('🔧 Document modifié:', updated[index]);
    setDocuments(updated);
  };

  const handleFileUpload = async (index: number, file: File) => {
    // Set processing state
    setProcessingFiles(prev => ({ ...prev, [index]: true }));
    setError(''); // Clear previous errors
    
    console.log('🔥 DEBUT EXTRACTION - Fichier:', file.name, 'Type:', file.type, 'Taille:', file.size);
    
    try {
      // Copie exacte de la logique de l'analyse simple qui fonctionne
      let analysisText = '';

      if (file.type === 'application/pdf') {
        console.log('📄 Fichier PDF détecté');
        try {
          console.log('📄 Tentative extraction PDF native...');
          analysisText = await extractTextFromPDF(file);
          console.log('📄 Texte extrait (natif):', analysisText.length, 'caractères');
          console.log('📄 Première ligne:', analysisText.substring(0, 100));
          if (!analysisText.trim()) {
            console.log('📄 PDF vide, passage à l\'OCR');
            throw new Error('PDF vide');
          }
          console.log('✅ Extraction PDF native réussie');
        } catch (pdfError) {
          console.log('❌ Extraction PDF native échouée:', pdfError);
          console.log('🔄 Passage à l\'OCR par pages...');
          
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let ocrText = '';
          console.log('📄 PDF chargé, nombre de pages:', pdf.numPages);

          for (let i = 1; i <= pdf.numPages; i++) {
            console.log(`🔄 OCR page ${i}/${pdf.numPages}...`);
            const page = await pdf.getPage(i);
            const canvas = document.createElement('canvas');
            const viewport = page.getViewport({ scale: 2 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
            const dataUrl = canvas.toDataURL('image/png');
            console.log(`📄 Page ${i} convertie en image, taille:`, dataUrl.length);
            const pageText = await extractTextWithOCR(dataUrl);
            console.log(`📄 Page ${i} OCR terminé, texte:`, pageText.length, 'caractères');
            ocrText += '\n' + pageText;
          }

          analysisText = ocrText.trim();
          console.log('🔄 OCR total terminé, texte final:', analysisText.length, 'caractères');
        }
      } else {
        console.log('🖼️ Fichier image détecté');
        analysisText = await extractTextWithOCR(file);
        console.log('🖼️ OCR image terminé:', analysisText.length, 'caractères');
      }

      console.log('🎯 RESULTATS FINAUX:');
      console.log('- Longueur texte:', analysisText.length);
      console.log('- Texte vide?', !analysisText.trim());
      console.log('- Premières 200 caractères:', analysisText.substring(0, 200));

      if (!analysisText.trim()) {
        throw new Error(`Le fichier ${file.name} ne contient pas de texte extractible.`);
      }

      // Mise à jour en une seule fois pour éviter les race conditions
      const updated = [...documents];
      updated[index] = { 
        ...updated[index], 
        text: analysisText, 
        source: 'ocr', 
        name: file.name 
      };
      console.log('🔧 MISE A JOUR DIRECTE:', updated[index]);
      setDocuments(updated);
      console.log('✅ EXTRACTION COMPLETE REUSSIE pour:', file.name);
      
      // Debug state après mise à jour
      setTimeout(() => {
        console.log('🔍 VERIFICATION STATE après updateDocument:');
        console.log('- Index:', index);
        console.log('- Documents state:', documents);
        console.log('- Document spécifique:', documents[index]);
      }, 100);
    } catch (err: any) {
      console.error('🚨 ERREUR FINALE handleFileUpload:', err);
      console.error('🚨 Stack trace:', err.stack);
      setError(err.message || 'Erreur lors du traitement du fichier');
    } finally {
      // Clear processing state
      setProcessingFiles(prev => ({ ...prev, [index]: false }));
      console.log('🏁 Fin du traitement pour:', file.name);
    }
  };

  const handleCompare = async () => {
    if (!user) return;

    if (documents.length < 2) {
      setError('Au moins 2 documents sont requis pour la comparaison');
      return;
    }

    const validDocs = documents.filter(doc => doc.text.trim().length > 0);
    if (validDocs.length < 2) {
      const emptyDocs = documents.filter(doc => doc.text.trim().length === 0);
      const emptyDocNames = emptyDocs.map(doc => doc.name).join(', ');
      setError(`Au moins 2 documents avec du contenu sont requis. Documents sans contenu: ${emptyDocNames}. Vérifiez que l'extraction de texte a réussi.`);
      return;
    }

    setError('');
    setResult(null);
    setLoading(true);

    try {
      console.log('🚀 Début de la comparaison');
      console.log('📊 Documents valides:', validDocs);
      console.log('📊 Nombre de documents:', validDocs.length);
      validDocs.forEach((doc, i) => {
        console.log(`📄 Document ${i}:`, {
          name: doc.name,
          source: doc.source,
          textLength: doc.text.length,
          textPreview: doc.text.substring(0, 100)
        });
      });
      
      const token = await user.getIdToken(true);
      console.log('🔑 Token obtenu, longueur:', token.length);
      
      const analysisResult = await compareDocuments(token, validDocs);
      console.log('✅ Analyse comparative réussie:', analysisResult);
      setResult(analysisResult);
    } catch (err: any) {
      console.error('🚨 ERREUR lors de la comparaison:', err);
      console.error('🚨 Type d\'erreur:', typeof err);
      console.error('🚨 Message:', err.message);
      console.error('🚨 Stack:', err.stack);
      setError(err.message || 'Erreur lors de la comparaison');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="compare-main">
        <h1 className="compare-title">🔍 Analyse Comparative</h1>
        <p className="compare-subtitle">Comparez plusieurs documents CGA pour identifier les meilleures pratiques et clauses problématiques.</p>

        <div className="premium-badge">
          ⭐ Fonctionnalité Premium
        </div>

        <div className="documents-section">
          <div className="section-header">
            <h2>Documents à comparer</h2>
            <button className="btn btn-secondary" onClick={addDocument} disabled={documents.length >= 5}>
              + Ajouter un document
            </button>
          </div>

          {documents.map((doc, index) => (
            <div key={index} className="document-card">
              <div className="document-header">
                <input
                  type="text"
                  value={doc.name}
                  onChange={(e) => updateDocument(index, 'name', e.target.value)}
                  placeholder={`Document ${index + 1}`}
                  className="document-name"
                />
                {processingFiles[index] && (
                  <span className="processing-indicator">
                    🔄 Traitement en cours...
                  </span>
                )}
                {!processingFiles[index] && doc.text && doc.text.trim().length > 0 && (
                  <span className="text-extracted-indicator" title={`${doc.text.length} caractères extraits`}>
                    ✅ Texte extrait ({doc.text.length} chars)
                  </span>
                )}
                {!processingFiles[index] && (!doc.text || doc.text.trim().length === 0) && doc.name !== `Document ${index + 1}` && (
                  <span className="extraction-failed-indicator">
                    ❌ Extraction échouée
                  </span>
                )}
                <button className="remove-btn" onClick={() => removeDocument(index)}>×</button>
              </div>

              <div className="document-input">
                <div className="input-tabs">
                  <label>
                    <input
                      type="radio"
                      checked={doc.source === 'upload'}
                      onChange={() => updateDocument(index, 'source', 'upload')}
                    />
                    Texte
                  </label>
                  <label>
                    <input
                      type="radio"
                      checked={doc.source === 'ocr'}
                      onChange={() => updateDocument(index, 'source', 'ocr')}
                    />
                    Fichier
                  </label>
                </div>

                {doc.source === 'upload' ? (
                  <textarea
                    value={doc.text}
                    onChange={(e) => updateDocument(index, 'text', e.target.value)}
                    placeholder="Coller le texte du document ici..."
                    rows={6}
                  />
                ) : (
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload(index, e.target.files[0])}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {documents.length === 0 && (
          <div className="empty-state">
            <p>Aucun document ajouté. Cliquez sur "Ajouter un document" pour commencer.</p>
          </div>
        )}

        <div className="compare-actions">
          <button 
            className="btn btn-primary" 
            onClick={handleCompare} 
            disabled={loading || documents.length < 2}
          >
            {loading ? 'Comparaison en cours...' : 'Lancer la comparaison'}
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="comparison-result">
            <h2>📊 Résultat de la comparaison</h2>
            
            <div className="result-section">
              <h3>Résumé</h3>
              <p>{result.summary}</p>
            </div>

            <div className="result-section">
              <h3>Tableau comparatif</h3>
              <div className="comparison-table">
                {result.comparisonTable.map((item, i) => (
                  <div key={i} className="comparison-row">
                    <div className="criteria">{item.criteria}</div>
                    <div className="document-scores">
                      {item.documents.map((doc, j) => (
                        <div key={j} className="doc-score">
                          <strong>{doc.name}</strong>
                          <span className={`score score-${doc.score}`}>{doc.score}/5</span>
                          <span className="value">{doc.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-section">
              <h3>Meilleures pratiques identifiées</h3>
              <ul>
                {result.bestPractices.map((practice, i) => (
                  <li key={i} className="best-practice">✅ {practice}</li>
                ))}
              </ul>
            </div>

            <div className="result-section">
              <h3>Signaux d'alarme</h3>
              <ul>
                {result.redFlags.map((flag, i) => (
                  <li key={i} className="red-flag">⚠️ {flag}</li>
                ))}
              </ul>
            </div>

            <div className="result-section">
              <h3>Classement global</h3>
              <div className="ranking">
                {result.overallRanking.map((item, i) => (
                  <div key={i} className="ranking-item">
                    <span className="rank">#{item.rank}</span>
                    <div className="ranking-details">
                      <strong>{item.name}</strong>
                      <p>{item.justification}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Compare;