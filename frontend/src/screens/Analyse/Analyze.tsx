'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyzeCGA } from '@/services/analyze';
import { fetchDashboardData } from '@/services/InfoService';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import Sidebar from '@/components/Layout/Sidebar';
import './Analyze.css';

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

type TextItem = { str: string };
type TextContent = { items: Array<TextItem | { type: string }> };

const Analyze: React.FC = () => {
  const { user } = useAuth();
  const [quota, setQuota] = useState({ used: 0, limit: -1 });
  const [sourceType, setSourceType] = useState<'text' | 'file'>('text');
  const [inputText, setInputText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ summary: string; score: string; clauses: string[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadQuota = async () => {
      if (!user) return;
      const token = await user.getIdToken(true);
      const infos = await fetchDashboardData(token);
      setQuota(infos.quota);
    };
    loadQuota();
  }, [user]);

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

  const handleSubmit = async () => {
    if (!user) return;

    setError('');
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
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
      setOcrStatus('');
    }
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="analyze-main">
        <h1 className="analyze-title">🧾 Analyse de CGA</h1>
        <p className="analyze-subtitle">Soumettez un document ou un texte pour analyse juridique automatique.</p>

        <p className="analyze-quota">
          📊 <strong>Quota :</strong> {quota.used} / {quota.limit === -1 ? '∞' : quota.limit} analyses utilisées
        </p>

        <div className="analyze-form">
          <label>Source</label>
          <select value={sourceType} onChange={(e) => setSourceType(e.target.value as 'text' | 'file')}>
            <option value="text">Texte (copier-coller)</option>
            <option value="file">OCR (image/PDF)</option>
          </select>

          {sourceType === 'text' && (
            <textarea
              placeholder="Texte CGA à analyser"
              rows={8}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          )}

          {sourceType === 'file' && (
            <>
              <label>📄 Fichier image ou PDF</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              {file && <p className="file-name">Fichier sélectionné : {file.name}</p>}
            </>
          )}

          <button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Analyse en cours...' : "Lancer l'analyse"}
          </button>

          {ocrStatus && <p className="ocr-status">{ocrStatus}</p>}
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {result && (
          <div className="analyze-result">
            <h2>📊 Résultat de l’analyse</h2>
            <p className="result-desc">Analyse synthétique du document soumis</p>

            <div className="result-section">
              <h3>Résumé</h3>
              <p>{result.summary}</p>
            </div>

            <div className="result-section">
              <h3>Score</h3>
              <span className={`badge badge-${result.score.toLowerCase()}`}>{result.score}</span>
            </div>

            <div className="result-section">
              <h3>Clauses importantes</h3>
              <ul>
                {result.clauses.map((clause, i) => (
                  <li key={i}>{clause}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Analyze;
