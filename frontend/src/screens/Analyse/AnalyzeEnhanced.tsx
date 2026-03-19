'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';
import { analyzeCGAStream, analyzeGuestStream, type AnalysisProgress } from '@/services/analyze';
import { fetchDashboardData } from '@/services/InfoService';
import { exportAnalysisPdf } from '@/services/export';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import Sidebar from '@/components/Layout/Sidebar';
import EmailVerificationBanner from '@/components/common/EmailVerificationBanner';
import { sampleContracts, getSampleContract } from '@/utils/sampleContracts';
import UpgradePrompt from '@/components/common/UpgradePrompt';
import AIDisclaimer from '@/components/common/AIDisclaimer';
import AIConsentModal from '@/components/common/AIConsentModal';
import './Analyze.css';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

type TextItem = { str: string };
type TextContent = { items: Array<TextItem | { type: string }> };

const AnalyzeEnhanced: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const isGuest = !authLoading && !user;

  const [searchParams] = useSearchParams();
  const [quota, setQuota] = useState({ used: 0, limit: -1 });
  const [sourceType, setSourceType] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{
    summary: string;
    score: string;
    clauses: string[];
    analysisId?: string;
    canExportPdf?: boolean;
    aiModelUsed?: string;
    confidenceLevel?: 'high' | 'medium' | 'low';
    requiresHumanReview?: boolean;
    promptVersion?: string;
    jurisdiction?: string;
    isGuest?: boolean;
  } | null>(null);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentLoading, setConsentLoading] = useState(false);
  const [hasAIConsent, setHasAIConsent] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [ocrStatus, setOcrStatus] = useState('');
  const [error, setError] = useState('');
  const [quotaError, setQuotaError] = useState<{message: string, upgradeRequired: boolean, currentPlan: string} | null>(null);
  const [guestLimitReached, setGuestLimitReached] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSamples, setShowSamples] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    if (isGuest) return;
    const loadQuota = async () => {
      if (!user) return;
      const token = await user.getIdToken(true);
      const infos = await fetchDashboardData(token);
      setQuota(infos.quota);
      setIsFirstTime(infos.quota.used === 0);
      setUserPlan(infos.plan || 'free');

      try {
        const { API_BASE_URL } = await import('@/config/api');
        const consentRes = await fetch(`${API_BASE_URL}/api/gdpr/consent`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (consentRes.ok) {
          const data = await consentRes.json();
          setHasAIConsent(data.consent?.aiProcessing === true);
        }
      } catch {
        setHasAIConsent(false);
      }
    };
    loadQuota();

    if (searchParams.get('sample') === 'true') {
      setShowSamples(true);
    }
  }, [user, isGuest, searchParams]);

  const extractTextFromPDF = async (pdfFile: File): Promise<string> => {
    setOcrStatus('Extraction du texte natif du PDF...');
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
    setOcrStatus('OCR en cours...');
    const { data } = await Tesseract.recognize(input, 'fra', {
      logger: m => setOcrStatus(`OCR: ${Math.round(m.progress * 100)}%`),
    });
    return data.text;
  };

  const handleExportPdf = async () => {
    if (!user || !result?.analysisId) return;
    try {
      const token = await user.getIdToken(true);
      const response = await exportAnalysisPdf(token, result.analysisId);
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
      setError(err.message || "Erreur lors de l'export PDF");
    }
  };

  const handleGrantConsent = async () => {
    if (!user) return;
    setConsentLoading(true);
    try {
      const { API_BASE_URL } = await import('@/config/api');
      const token = await user.getIdToken(true);
      const res = await fetch(`${API_BASE_URL}/api/gdpr/ai-consent`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ aiProcessing: true }),
      });
      if (res.ok) {
        setHasAIConsent(true);
        setShowConsentModal(false);
        handleSubmit();
      } else {
        setError("Erreur lors de l'enregistrement du consentement. Veuillez réessayer.");
        setShowConsentModal(false);
      }
    } catch {
      setError('Erreur réseau lors de l\'enregistrement du consentement.');
      setShowConsentModal(false);
    } finally {
      setConsentLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setQuotaError(null);
    setGuestLimitReached(false);
    setResult(null);
    setProgress(null);
    setLoading(true);
    setOcrStatus('');

    try {
      // ── Guest path ───────────────────────────────────────────────────────
      if (isGuest) {
        const response = await analyzeGuestStream(inputText, (p) => setProgress(p));
        setResult(response);
        setLoading(false);
        setProgress(null);
        setOcrStatus('');
        return;
      }

      // ── Authenticated path ───────────────────────────────────────────────
      if (!user) return;

      if (hasAIConsent === false) {
        setShowConsentModal(true);
        setLoading(false);
        return;
      }

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
      const response = await analyzeCGAStream(token, analysisText, apiSource, (p) => setProgress(p));
      setResult(response);

      const infos = await fetchDashboardData(token);
      setQuota(infos.quota);
    } catch (err: any) {
      if ((err as any).guestLimitReached || err.status === 429) {
        setGuestLimitReached(true);
      } else if (err.quotaReached || err.status === 429) {
        setQuotaError({ message: err.message, upgradeRequired: err.upgradeRequired || false, currentPlan: err.currentPlan || 'free' });
      } else if (err.upgradeRequired || (err.status === 403 && !err.consentRequired)) {
        setQuotaError({ message: err.message, upgradeRequired: true, currentPlan: err.currentPlan || 'free' });
      } else if (err.consentRequired) {
        setShowConsentModal(true);
      } else {
        setError(err.message || 'Erreur inconnue');
      }
    } finally {
      setLoading(false);
      setProgress(null);
      setOcrStatus('');
    }
  };

  const loadSampleContract = (type: string) => {
    const sample = getSampleContract(type);
    if (sample) {
      setInputText(sample.content);
      setSourceType('text');
      setShowSamples(false);
      document.querySelector('.g-form-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const resetForm = () => {
    setResult(null);
    setInputText('');
    setFile(null);
    setError('');
    setGuestLimitReached(false);
  };

  // ── Guest layout ──────────────────────────────────────────────────────────
  if (isGuest) {
    return (
      <div className="g-shell">
        {/* Loading progress bar — CSS animated, shown only when loading */}
        {loading && <div className="g-loading-bar" aria-hidden="true"><div className="g-loading-bar-fill" /></div>}

        {/* Masthead */}
        <header className="g-masthead">
          <div className="g-masthead-inner">
            <div className="g-masthead-left">
              <div className="g-masthead-rule-top" />
              <Link to="/" className="g-logo">TransparAI</Link>
              <div className="g-masthead-rule-bottom" />
            </div>
            <nav className="g-masthead-nav">
              <Link to="/login" className="g-nav-link">Connexion</Link>
              <span className="g-nav-sep" aria-hidden="true">|</span>
              <Link to="/signup" className="g-nav-cta">Compte gratuit</Link>
            </nav>
          </div>
        </header>

        <main className="g-main">

          {/* ── HERO — split layout ────────────────────────────────────── */}
          {!result && !guestLimitReached && (
            <section className="g-hero">
              <div className="g-hero-left">
                <span className="g-eyebrow">Démo gratuite &mdash; sans inscription</span>
                <div className="g-hero-rule" />
                <h1 className="g-hero-h1">
                  Analysez votre<br />
                  <em>contrat</em> en<br />
                  30 secondes.
                </h1>
                <p className="g-hero-sub">
                  Collez n'importe quel contrat, CGU ou bail. Notre IA le résume, le note
                  et identifie les clauses à risque — gratuitement, sans compte.
                </p>
                <div className="g-trust-row">
                  <span className="g-trust-item">Données hébergées en UE</span>
                  <span className="g-trust-dot" />
                  <span className="g-trust-item">Conforme RGPD</span>
                  <span className="g-trust-dot" />
                  <span className="g-trust-item">Avis IA, pas juridique</span>
                </div>
              </div>

              <div className="g-hero-right">
                {/* Static demo card */}
                <div className="g-demo-card">
                  <div className="g-demo-card-head">
                    <span className="g-demo-card-label">TransparAI — Exemple de résultat</span>
                    <span className="g-demo-card-model">Azure OpenAI GPT-4o</span>
                  </div>
                  <div className="g-demo-card-rule" />
                  <div className="g-demo-score-row">
                    <div className="g-demo-grade-block">
                      <span className="g-demo-grade">B+</span>
                      <span className="g-demo-grade-label">Équilibré</span>
                    </div>
                    <p className="g-demo-summary-text">
                      Contrat globalement équilibré. Attention à la clause de résiliation
                      automatique (art.&nbsp;12) et à la cession de données (art.&nbsp;8).
                    </p>
                  </div>
                  <div className="g-demo-card-rule" />
                  <ul className="g-demo-clauses">
                    <li className="g-demo-clause g-demo-clause--risk">
                      <span className="g-demo-clause-dot" />
                      Résiliation unilatérale sans préavis
                    </li>
                    <li className="g-demo-clause g-demo-clause--risk">
                      <span className="g-demo-clause-dot" />
                      Cession de données à des tiers non nommés
                    </li>
                    <li className="g-demo-clause g-demo-clause--ok">
                      <span className="g-demo-clause-dot" />
                      Droit de rétractation conforme (14 jours)
                    </li>
                  </ul>
                  <div className="g-demo-card-foot">
                    <span>analysé en 24s</span>
                    <span>Conforme EU AI Act Art. 13</span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── GUEST LIMIT WALL ──────────────────────────────────────── */}
          {guestLimitReached && (
            <div className="g-limit-wall">
              <div className="g-limit-wall-inner">
                <span className="g-eyebrow">Limite atteinte</span>
                <div className="g-hero-rule" />
                <h2 className="g-limit-title">Vous avez utilisé votre analyse gratuite du jour</h2>
                <p className="g-limit-body">
                  Créez un compte gratuit pour obtenir 5 analyses par mois, l'upload PDF et l'OCR — sans carte bancaire.
                </p>
                <div className="g-limit-actions">
                  <Link to="/signup" className="g-submit-btn">Créer un compte gratuit</Link>
                  <Link to="/login" className="g-outline-btn">Se connecter</Link>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ───────────────────────────────────────────────── */}
          {result && !guestLimitReached && (
            <div className="g-result-section">
              <div className="g-result-masthead">
                <span className="g-eyebrow">Analyse terminée</span>
                <div className="g-hero-rule" />
                <h2 className="g-result-title">Voici ce que notre IA a découvert</h2>
              </div>

              <AIDisclaimer
                modelUsed={result.aiModelUsed}
                confidenceLevel={result.confidenceLevel}
                requiresHumanReview={result.requiresHumanReview}
                promptVersion={result.promptVersion}
                jurisdiction={result.jurisdiction}
              />

              <div className="g-result-grid">
                <div className="g-result-card">
                  <p className="g-result-card-label">Score de transparence</p>
                  <div className="g-score-display">
                    <span className={`g-score-badge g-score-${result.score.toLowerCase()}`}>{result.score}</span>
                  </div>
                  <p className="g-score-explanation">
                    {result.score === 'Excellent' && 'Ce contrat est très favorable et transparent.'}
                    {result.score === 'Bon' && "Ce contrat est globalement équilibré avec quelques points d'attention."}
                    {result.score === 'Moyen' && 'Ce contrat présente quelques clauses à surveiller.'}
                    {result.score === 'Médiocre' && 'Ce contrat contient plusieurs clauses défavorables.'}
                    {result.score === 'Problématique' && 'Attention ! Ce contrat présente des risques importants.'}
                  </p>
                </div>

                <div className="g-result-card g-result-card--wide">
                  <p className="g-result-card-label">Résumé en français simple</p>
                  <div className="g-result-body">{result.summary}</div>
                </div>

                <div className="g-result-card g-result-card--wide">
                  <p className="g-result-card-label">Points d'attention</p>
                  <ul className="g-clauses-list">
                    {result.clauses.map((clause, i) => (
                      <li key={i} className="g-clause-item">
                        <span className="g-clause-marker" />
                        {clause}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Signup wall — membership offer */}
              <div className="g-membership-wall">
                <div className="g-membership-inner">
                  <span className="g-membership-eyebrow">Votre analyse est prête</span>
                  <div className="g-membership-rule" />
                  <h2 className="g-membership-title">
                    Sauvegardez ce résultat.<br />
                    <em>Analysez d'autres contrats.</em>
                  </h2>
                  <p className="g-membership-body">
                    Créez un compte gratuit pour conserver vos analyses, uploader des PDF
                    et obtenir 5 analyses par mois — sans carte bancaire.
                  </p>
                  <div className="g-perks-grid">
                    <div className="g-perk-cell">
                      <span className="g-perk-num">5</span>
                      <span className="g-perk-label">analyses / mois gratuites</span>
                    </div>
                    <div className="g-perk-cell">
                      <span className="g-perk-num">PDF</span>
                      <span className="g-perk-label">upload &amp; OCR inclus</span>
                    </div>
                    <div className="g-perk-cell">
                      <span className="g-perk-num">0&nbsp;€</span>
                      <span className="g-perk-label">sans carte bancaire</span>
                    </div>
                  </div>
                  <div className="g-membership-actions">
                    <Link to="/signup" className="g-membership-cta">Créer un compte gratuit</Link>
                    <Link to="/login" className="g-membership-secondary">Déjà un compte ? Se connecter</Link>
                  </div>
                </div>
              </div>

              <div className="g-result-reset">
                <button className="g-outline-btn" onClick={resetForm}>Nouvelle analyse</button>
              </div>
            </div>
          )}

          {/* ── FORM ──────────────────────────────────────────────────── */}
          {!result && !guestLimitReached && (
            <section className="g-form-section">

              {/* Sample contracts panel */}
              {showSamples && (
                <div className="g-samples-panel">
                  <div className="g-samples-head">
                    <span className="g-samples-title">Contrats d'exemple</span>
                    <button className="g-samples-close" onClick={() => setShowSamples(false)} aria-label="Fermer">&#215;</button>
                  </div>
                  <div className="g-samples-grid">
                    {Object.entries(sampleContracts).map(([key, contract]) => (
                      <button key={key} className="g-sample-card" onClick={() => loadSampleContract(key)}>
                        <h4 className="g-sample-title">{contract.title}</h4>
                        <p className="g-sample-excerpt">{contract.content.substring(0, 120)}…</p>
                        <span className="g-sample-cta">Analyser cet exemple &#8594;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Document editor */}
              <div className="g-editor">
                <div className="g-editor-header">
                  <div className="g-editor-header-left">
                    <span className="g-editor-label">Document à analyser</span>
                    <span className="g-editor-hint">Texte, CGU, bail, contrat de travail…</span>
                  </div>
                  {!showSamples && (
                    <button className="g-samples-toggle" onClick={() => setShowSamples(true)}>
                      Essayer un exemple
                    </button>
                  )}
                </div>

                <div className="g-editor-rule" />

                <textarea
                  className="g-editor-textarea"
                  placeholder="Collez ici vos conditions générales, contrat de travail, bail, ou tout autre document juridique à analyser…"
                  rows={14}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                />

                <div className="g-editor-footer">
                  <span className="g-char-count">
                    {inputText.length > 0 ? (
                      <>
                        {inputText.length.toLocaleString('fr-FR')} caractères
                        {inputText.length > 10000 && (
                          <span className="g-char-warn"> — limité à 10 000 en mode démo</span>
                        )}
                      </>
                    ) : (
                      'Limite démo : 10 000 caractères'
                    )}
                  </span>
                  {/* Footnote-style PDF notice */}
                  <span className="g-pdf-footnote">
                    * Upload PDF disponible avec un <Link to="/signup">compte gratuit</Link>
                  </span>
                </div>
              </div>

              {/* Progress bar (inline, shown while loading) */}
              {loading && (
                <div className="g-progress-wrap">
                  <div className="g-progress-track">
                    <div
                      className="g-progress-fill"
                      style={{ width: progress ? `${progress.percent}%` : '15%' }}
                    />
                  </div>
                  <p className="g-progress-label">
                    {ocrStatus || (progress ? progress.message : 'Analyse en cours…')}
                  </p>
                </div>
              )}

              {/* Submit */}
              <div className="g-submit-row">
                <button
                  className="g-submit-btn"
                  onClick={handleSubmit}
                  disabled={loading || !inputText.trim()}
                >
                  {loading ? 'Analyse en cours…' : 'Analyser avec l\'IA'}
                </button>
                {!inputText.trim() && !loading && (
                  <span className="g-submit-hint">Collez d'abord votre contrat ci-dessus</span>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="g-error-bar">
                  <span className="g-error-label">Erreur</span>
                  <span className="g-error-msg">{error}</span>
                  <button className="g-error-close" onClick={() => setError('')}>&#215;</button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    );
  }

  // ── Authenticated layout (existing) ──────────────────────────────────────
  return (
    <div className="dashboard-layout">
      {showConsentModal && (
        <AIConsentModal
          onAccept={handleGrantConsent}
          onDecline={() => setShowConsentModal(false)}
          loading={consentLoading}
        />
      )}
      <EmailVerificationBanner />
      <button className="hamburger-toggle az-hamburger" onClick={() => setIsSidebarOpen(true)}>
        <span className="az-hamburger-bar" />
        <span className="az-hamburger-bar" />
        <span className="az-hamburger-bar" />
      </button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="analyze-main az-main">
        {isFirstTime && (
          <div className="az-welcome-banner">
            <span className="az-welcome-eyebrow">Bienvenue</span>
            <p className="az-welcome-text">Choisissez un exemple ou collez votre propre contrat pour commencer.</p>
          </div>
        )}

        <div className="az-page-header">
          <h1 className="az-page-title">Analyse de contrat</h1>
          <p className="az-page-subtitle">Notre IA analyse votre document en 30 secondes et vous explique tout en français simple.</p>
          <div className="az-header-rule" />
        </div>

        <div className="az-quota-row">
          <div className="az-quota-block">
            <span className="az-quota-label">Analyses ce mois</span>
            <span className="az-quota-count">
              <strong>{quota.used}</strong>
              <span className="az-quota-sep">/</span>
              <span>{quota.limit === -1 ? '∞' : quota.limit}</span>
            </span>
            {quota.limit !== -1 && (
              <div className="az-quota-bar">
                <div
                  className={`az-quota-fill ${quota.used / quota.limit > 0.8 ? 'az-quota-fill--warn' : ''}`}
                  style={{ width: `${Math.min((quota.used / quota.limit) * 100, 100)}%` }}
                />
              </div>
            )}
          </div>
          {!showSamples && (
            <button className="az-samples-toggle" onClick={() => setShowSamples(true)}>
              Essayer un exemple
            </button>
          )}
        </div>

        {showSamples && (
          <div className="az-samples-section">
            <div className="az-samples-head">
              <span className="az-samples-label">Contrats d'exemple</span>
              <button className="az-samples-close" onClick={() => setShowSamples(false)}>&#215;</button>
            </div>
            <div className="az-samples-grid">
              {Object.entries(sampleContracts).map(([key, contract]) => (
                <button key={key} className="az-sample-card" onClick={() => loadSampleContract(key)}>
                  <h4 className="az-sample-title">{contract.title}</h4>
                  <p className="az-sample-excerpt">{contract.content.substring(0, 150)}…</p>
                  <span className="az-sample-cta">Analyser cet exemple &#8594;</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="az-form">
          <div className="az-form-header">
            <h3 className="az-form-label">Document à analyser</h3>
            <div className="az-source-tabs">
              <button
                className={`az-source-tab ${sourceType === 'text' ? 'az-source-tab--active' : ''}`}
                onClick={() => setSourceType('text')}
              >
                Texte
              </button>
              <button
                className={`az-source-tab ${sourceType === 'file' ? 'az-source-tab--active' : ''}`}
                onClick={() => setSourceType('file')}
              >
                Fichier
              </button>
            </div>
          </div>
          <div className="az-form-rule" />

          {sourceType === 'text' && (
            <div className="az-text-section">
              <textarea
                placeholder="Collez ici les conditions générales, contrat de travail, bail, ou tout autre document juridique..."
                rows={12}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="az-textarea"
              />
              {inputText.length > 0 && (
                <div className="az-text-stats">
                  {inputText.length.toLocaleString('fr-FR')} caractères &bull; {Math.ceil(inputText.split(' ').length / 200)} min de lecture
                </div>
              )}
            </div>
          )}

          {sourceType === 'file' && (
            <div className="az-file-section">
              <div className="az-file-drop">
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="az-file-input"
                  id="az-file-upload"
                />
                <label htmlFor="az-file-upload" className="az-file-label">
                  {file ? (
                    <>
                      <span className="az-file-name">{file.name}</span>
                      <span className="az-file-change">Cliquer pour changer</span>
                    </>
                  ) : (
                    <>
                      <span className="az-file-prompt">Cliquez pour choisir un fichier</span>
                      <span className="az-file-formats">PDF, JPG, PNG acceptés</span>
                    </>
                  )}
                </label>
              </div>
              {file && <div className="az-file-info">{file.name} &mdash; {(file.size / 1024 / 1024).toFixed(2)} MB</div>}
            </div>
          )}

          <div className="az-submit-section">
            <button
              onClick={handleSubmit}
              disabled={loading || (sourceType === 'text' && !inputText.trim()) || (sourceType === 'file' && !file)}
              className="az-analyze-btn"
            >
              {loading ? 'Analyse en cours…' : 'Analyser avec l\'IA'}
            </button>

            {loading && (
              <div className="az-progress">
                {ocrStatus && <p className="az-progress-label">{ocrStatus}</p>}
                {progress && (
                  <>
                    <div className="az-progress-track">
                      <div className="az-progress-fill" style={{ width: `${progress.percent}%` }} />
                    </div>
                    <p className="az-progress-label">{progress.message}</p>
                  </>
                )}
              </div>
            )}

            {sourceType === 'text' && !inputText.trim() && !loading && (
              <p className="az-form-hint">Collez votre contrat dans la zone de texte ci-dessus</p>
            )}
            {sourceType === 'file' && !file && !loading && (
              <p className="az-form-hint">Sélectionnez un fichier PDF ou image à analyser</p>
            )}
          </div>
        </div>

        {quotaError && (
          <div className="az-quota-error">
            <h4 className="az-quota-error-title">Quota atteint</h4>
            <p className="az-quota-error-body">{quotaError.message}</p>
            {quotaError.upgradeRequired && (
              <div className="az-quota-error-actions">
                <button className="az-analyze-btn" onClick={() => window.location.href = '/upgrade'}>Voir les plans</button>
                <button className="az-outline-btn" onClick={() => setQuotaError(null)}>Fermer</button>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="az-error-bar">
            <h4 className="az-error-title">Erreur lors de l'analyse</h4>
            <p className="az-error-body">{error}</p>
            <button className="az-outline-btn" onClick={() => setError('')}>Réessayer</button>
          </div>
        )}

        {result && (
          <div className="az-result">
            <div className="az-result-header">
              <span className="az-result-eyebrow">Analyse terminée</span>
              <div className="az-header-rule" />
              <h2 className="az-result-title">Ce que notre IA a découvert</h2>
            </div>

            <AIDisclaimer
              modelUsed={result.aiModelUsed}
              confidenceLevel={result.confidenceLevel}
              requiresHumanReview={result.requiresHumanReview}
              promptVersion={result.promptVersion}
              jurisdiction={result.jurisdiction}
            />

            <div className="az-result-grid">
              <div className="az-result-card az-result-card--score">
                <p className="az-result-card-label">Score de transparence</p>
                <div className="az-score-display">
                  <span className={`az-score-badge az-score-${result.score.toLowerCase().replace(/é/g, 'e').replace(/î/g, 'i')}`}>{result.score}</span>
                </div>
                <p className="az-score-explanation">
                  {result.score === 'Excellent' && 'Ce contrat est très favorable et transparent.'}
                  {result.score === 'Bon' && "Ce contrat est globalement équilibré avec quelques points d'attention."}
                  {result.score === 'Moyen' && 'Ce contrat présente quelques clauses à surveiller.'}
                  {result.score === 'Médiocre' && 'Ce contrat contient plusieurs clauses défavorables.'}
                  {result.score === 'Problématique' && 'Attention — ce contrat présente des risques importants.'}
                </p>
              </div>

              <div className="az-result-card az-result-card--summary">
                <p className="az-result-card-label">Résumé en français simple</p>
                <div className="az-result-body">{result.summary}</div>
              </div>

              <div className="az-result-card az-result-card--clauses">
                <p className="az-result-card-label">Points d'attention</p>
                <ul className="az-clauses-list">
                  {result.clauses.map((clause, i) => (
                    <li key={i} className="az-clause-item">
                      <span className="az-clause-marker" />
                      {clause}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="az-value-row">
              <div className="az-value-cell">
                <span className="az-value-num">2–3h</span>
                <span className="az-value-label">économisées sur la lecture</span>
              </div>
              <div className="az-value-cell">
                <span className="az-value-num">{result.clauses.length}</span>
                <span className="az-value-label">risques identifiés</span>
              </div>
              <div className="az-value-cell">
                <span className="az-value-num">100%</span>
                <span className="az-value-label">pouvoir de négociation</span>
              </div>
            </div>

            {(userPlan === 'free' || userPlan === 'starter') && (
              <UpgradePrompt context="enhanced_features" />
            )}

            <div className="az-result-actions">
              <button className="az-outline-btn" onClick={resetForm}>
                Nouvelle analyse
              </button>
              {result.canExportPdf && (
                <button className="az-outline-btn" onClick={handleExportPdf}>
                  Télécharger en PDF
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
