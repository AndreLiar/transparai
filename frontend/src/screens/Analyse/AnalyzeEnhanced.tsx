'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import { analyzeCGA } from '@/services/analyze';
import { fetchDashboardData } from '@/services/InfoService';
import { exportAnalysisPdf } from '@/services/export';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import Sidebar from '@/components/Layout/Sidebar';
import EmailVerificationBanner from '@/components/common/EmailVerificationBanner';
import { sampleContracts, getSampleContract } from '@/utils/sampleContracts';
import UpgradePrompt from '@/components/common/UpgradePrompt';
import './Analyze.css';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

type TextItem = { str: string };
type TextContent = { items: Array<TextItem | { type: string }> };

const AnalyzeEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [quota, setQuota] = useState({ used: 0, limit: -1 });
  const [sourceType, setSourceType] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ summary: string; score: string; clauses: string[]; analysisId?: string; canExportPdf?: boolean } | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [error, setError] = useState('');
  const [quotaError, setQuotaError] = useState<{message: string, upgradeRequired: boolean, currentPlan: string} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    const loadQuota = async () => {
      if (!user) return;
      const token = await user.getIdToken(true);
      const infos = await fetchDashboardData(token);
      setQuota(infos.quota);
      setIsFirstTime(infos.quota.used === 0);
      setUserPlan(infos.plan || 'free');
    };
    loadQuota();
    
    // Check if coming from dashboard with sample parameter
    if (searchParams.get('sample') === 'true') {
      setShowSamples(true);
    }
  }, [user, searchParams]);

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    setOcrStatus('📄 Extraction du texte natif du PDF...');
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
    setOcrStatus('🧠 OCR en cours...');
    const { data } = await Tesseract.recognize(input, 'fra', {
      logger: m => setOcrStatus(`🧠 OCR: ${Math.round(m.progress * 100)}%`),
    });
    return data.text;
  };

  const handleExportPdf = async () => {
    if (!user || !result?.analysisId) return;
    
    try {
      const token = await user.getIdToken(true);
      const response = await exportAnalysisPdf(token, result.analysisId);
      
      // Create download link
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analyse-cga-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'export PDF');
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setError('');
    setQuotaError(null);
    setResult(null);
    setLoading(true);
    setOcrStatus('');

    try {
      let analysisText = inputText;

      if (sourceType === 'file' && file) {
        if (file.type === 'application/pdf') {
          try {
            analysisText = await extractTextFromPDF(file);
            if (!analysisText.trim()) throw new Error('PDF vide');
          } catch {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let ocrText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const canvas = document.createElement('canvas');
              const viewport = page.getViewport({ scale: 2 });
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({ canvasContext: canvas.getContext('2d')!, viewport }).promise;
              const dataUrl = canvas.toDataURL('image/png');
              ocrText += '\n' + (await extractTextWithOCR(dataUrl));
            }

            analysisText = ocrText.trim();
          }
        } else {
          analysisText = await extractTextWithOCR(file);
        }
      }

      const token = await user.getIdToken(true);
      const apiSource = sourceType === 'text' ? 'upload' : 'ocr';
      const response = await analyzeCGA(token, analysisText, apiSource);
      setResult(response);

      const infos = await fetchDashboardData(token);
      setQuota(infos.quota);
    } catch (err: any) {
      if (err.response?.status === 429 && err.response?.data?.quotaReached) {
        // Quota exceeded error
        setQuotaError({
          message: err.response.data.message,
          upgradeRequired: err.response.data.upgradeRequired || false,
          currentPlan: err.response.data.currentPlan || 'free'
        });
      } else if (err.response?.status === 403 && err.response?.data?.upgradeRequired) {
        // Feature access error
        setQuotaError({
          message: err.response.data.message,
          upgradeRequired: true,
          currentPlan: err.response.data.currentPlan || 'free'
        });
      } else {
        setError(err.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
      setOcrStatus('');
    }
  };

  const loadSampleContract = (type: string) => {
    const sample = getSampleContract(type);
    if (sample) {
      setInputText(sample.content);
      setSourceType('text');
      setShowSamples(false);
      // Scroll to form
      document.querySelector('.analyze-form')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard-layout">
      <EmailVerificationBanner />
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="analyze-main">
        {isFirstTime && (
          <div className="first-time-banner">
            <div className="banner-content">
              <div className="banner-icon">🎉</div>
              <div className="banner-text">
                <h2>Bienvenue dans l'analyse TransparAI !</h2>
                <p>Vous êtes sur le point de découvrir la puissance de notre IA. Choisissez un exemple ou uploadez votre propre contrat.</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="analyze-header">
          <h1 className="analyze-title">📄 Analyse de contrat</h1>
          <p className="analyze-subtitle">Notre IA Gemini 2.0 Flash analyse votre document en 30 secondes et vous explique tout en français simple.</p>
        </div>

        <div className="quota-and-samples">
          <div className="quota-display">
            📊 <strong>{quota.used} / {quota.limit === -1 ? '∞' : quota.limit}</strong> analyses utilisées ce mois-ci
          </div>
          
          {!showSamples && (
            <button 
              className="samples-toggle" 
              onClick={() => setShowSamples(true)}
            >
              📁 Essayer avec un exemple
            </button>
          )}
        </div>
        
        {showSamples && (
          <div className="samples-section">
            <div className="samples-header">
              <h3>📁 Choisissez un contrat d'exemple</h3>
              <button 
                className="close-samples"
                onClick={() => setShowSamples(false)}
              >
                ×
              </button>
            </div>
            <div className="samples-grid">
              {Object.entries(sampleContracts).map(([key, contract]) => (
                <button
                  key={key}
                  className="sample-card"
                  onClick={() => loadSampleContract(key)}
                >
                  <h4>{contract.title}</h4>
                  <p>{contract.content.substring(0, 150)}...</p>
                  <div className="sample-cta">Analyser cet exemple →</div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="analyze-form">
          <div className="form-header">
            <h3>Votre contrat à analyser</h3>
            <div className="source-toggle">
              <button 
                className={`toggle-btn ${sourceType === 'text' ? 'active' : ''}`}
                onClick={() => setSourceType('text')}
              >
                📝 Texte
              </button>
              <button 
                className={`toggle-btn ${sourceType === 'file' ? 'active' : ''}`}
                onClick={() => setSourceType('file')}
              >
                📄 Fichier
              </button>
            </div>
          </div>

          {sourceType === 'text' && (
            <div className="text-input-section">
              <label>Copiez-collez votre contrat ici :</label>
              <textarea
                placeholder="Collez ici les conditions générales, contrat de travail, bail, ou tout autre document juridique que vous souhaitez analyser..."
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="contract-textarea"
              />
              {inputText.length > 0 && (
                <div className="text-stats">
                  {inputText.length} caractères • {Math.ceil(inputText.split(' ').length / 200)} min de lecture
                </div>
              )}
            </div>
          )}

          {sourceType === 'file' && (
            <div className="file-input-section">
              <label>Uploadez votre document (PDF ou image) :</label>
              <div className="file-upload-area">
                <input 
                  type="file" 
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  {file ? (
                    <>
                      📄 {file.name}
                      <span className="file-change">Cliquer pour changer</span>
                    </>
                  ) : (
                    <>
                      📁 Cliquez pour choisir un fichier
                      <span className="file-formats">PDF, JPG, PNG acceptés</span>
                    </>
                  )}
                </label>
              </div>
              {file && (
                <div className="file-info">
                  Fichier: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          )}

          <div className="submit-section">
            <button 
              onClick={handleSubmit} 
              disabled={loading || (sourceType === 'text' && !inputText.trim()) || (sourceType === 'file' && !file)}
              className="analyze-button"
            >
              {loading ? (
                <>
                  ⏳ Analyse en cours...
                  {ocrStatus && <span className="ocr-status">{ocrStatus}</span>}
                </>
              ) : (
                <>
                  🚀 Analyser avec l'IA
                  <span className="button-subtitle">Résultat en ~30 secondes</span>
                </>
              )}
            </button>
            
            {(sourceType === 'text' && !inputText.trim()) && (
              <p className="form-hint">Collez votre contrat dans la zone de texte ci-dessus</p>
            )}
            
            {(sourceType === 'file' && !file) && (
              <p className="form-hint">Sélectionnez un fichier PDF ou image à analyser</p>
            )}
          </div>
        </div>

        {quotaError && (
          <div className="quota-error-message">
            <div className="error-icon">📊</div>
            <div className="error-content">
              <h4>Quota atteint</h4>
              <p>{quotaError.message}</p>
              {quotaError.upgradeRequired && (
                <div className="error-actions">
                  <button 
                    className="upgrade-btn"
                    onClick={() => window.location.href = '/upgrade'}
                  >
                    Voir les plans
                  </button>
                  <button 
                    className="error-retry"
                    onClick={() => setQuotaError(null)}
                  >
                    Fermer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-content">
              <h4>Erreur lors de l'analyse</h4>
              <p>{error}</p>
              <button 
                className="error-retry"
                onClick={() => setError('')}
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="analyze-result">
            <div className="result-header">
              <h2>✅ Analyse terminée !</h2>
              <p>Voici ce que notre IA a découvert dans votre contrat :</p>
            </div>

            <div className="result-grid">
              <div className="result-card score-card">
                <h3>🎯 Score de transparence</h3>
                <div className="score-display">
                  <span className={`score-badge score-${result.score.toLowerCase()}`}>
                    {result.score}
                  </span>
                </div>
                <p className="score-explanation">
                  {result.score === 'Excellent' && 'Ce contrat est très favorable et transparent.'}
                  {result.score === 'Bon' && 'Ce contrat est globalement équilibré avec quelques points d\'attention.'}
                  {result.score === 'Moyen' && 'Ce contrat présente quelques clauses à surveiller.'}
                  {result.score === 'Médiocre' && 'Ce contrat contient plusieurs clauses défavorables.'}
                  {result.score === 'Problématique' && 'Attention ! Ce contrat présente des risques importants.'}
                </p>
              </div>

              <div className="result-card summary-card">
                <h3>📄 Résumé en français simple</h3>
                <div className="summary-content">
                  {result.summary}
                </div>
              </div>

              <div className="result-card clauses-card">
                <h3>⚠️ Points d'attention</h3>
                <ul className="clauses-list">
                  {result.clauses.map((clause, i) => (
                    <li key={i}>
                      <span className="clause-bullet">•</span>
                      {clause}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Value Reinforcement Section */}
            <div className="value-reinforcement">
              <div className="value-header">
                <div className="value-icon">💡</div>
                <h3>Félicitations ! Vous venez de gagner du temps et de l'argent</h3>
              </div>
              <div className="value-benefits">
                <div className="value-benefit">
                  <span className="benefit-icon">⏱️</span>
                  <div className="benefit-text">
                    <strong>2-3 heures économisées</strong>
                    <p>Vous avez évité de lire tout le document juridique complexe</p>
                  </div>
                </div>
                <div className="value-benefit">
                  <span className="benefit-icon">🛡️</span>
                  <div className="benefit-text">
                    <strong>Risques identifiés</strong>
                    <p>Clauses cachées découvertes qui auraient pu vous coûter cher</p>
                  </div>
                </div>
                <div className="value-benefit">
                  <span className="benefit-icon">💪</span>
                  <div className="benefit-text">
                    <strong>Pouvoir de négociation</strong>
                    <p>Vous pouvez maintenant discuter en connaissance de cause</p>
                  </div>
                </div>
              </div>
              <div className="value-cta">
                <p>Imaginez la valeur sur tous vos contrats importants : travail, bail, assurances...</p>
              </div>
            </div>

            {/* Post-Analysis Upgrade Prompt for Free Users */}
            {(userPlan === 'free' || userPlan === 'starter') && (
              <UpgradePrompt context="enhanced_features" />
            )}

            <div className="result-actions">
              <button 
                className="analyze-button secondary"
                onClick={() => {
                  setResult(null);
                  setInputText('');
                  setFile(null);
                  setError('');
                }}
              >
                🔄 Nouvelle analyse
              </button>
              
              {result.canExportPdf && (
                <button className="analyze-button outline" onClick={handleExportPdf}>
                  📄 Télécharger en PDF
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyzeEnhanced;