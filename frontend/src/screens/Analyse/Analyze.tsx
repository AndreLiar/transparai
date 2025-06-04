'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyzeCGA } from '@/services/analyze';
import { fetchDashboardData } from '@/services/InfoService';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
import Sidebar from '@/components/Layout/Sidebar';
import AnalyzeForm from '@/components/Analyze/AnalyzeForm';
import QuotaDisplay from '@/components/Analyze/QuotaDisplay';
import ResultDisplay from '@/components/Analyze/ResultDisplay';
import './Analyze.css'; // Optional custom styles

(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

type TextItem = { str: string };
type TextContent = { items: Array<TextItem | { type: string }> };

const Analyze: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ summary: string; score: string; clauses: string[] } | null>(null);
  const [quota, setQuota] = useState<{ used: number; limit: number } | null>(null);
  const [countdown, setCountdown] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = midnight.getTime() - now.getTime();
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setCountdown(`${h}h ${m}min`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadQuota = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken(true);
        const infos = await fetchDashboardData(token);
        setQuota(infos.quota);
      } catch (err) {
        console.error('Erreur chargement quota:', err);
      }
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
      const strings = content.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => item.str);
      extractedText += strings.join(' ') + '\n';
    }

    return extractedText.trim();
  };

  const extractTextWithOCR = async (input: File | string): Promise<string> => {
    setOcrStatus('🧠 OCR en cours...');
    const { data } = await Tesseract.recognize(input, 'fra', {
      logger: (m) => setOcrStatus(`🧠 OCR: ${Math.round(m.progress * 100)}%`),
    });
    return data.text;
  };

  const handleAnalyze = async (text: string, source: 'upload' | 'ocr', file: File | null) => {
    if (!user || (quota && quota.limit !== -1 && quota.used >= quota.limit)) return;

    setError('');
    setResult(null);
    setLoading(true);
    setOcrStatus('');

    try {
      let analysisText = text;

      if (source === 'ocr' && file) {
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
              const viewport = page.getViewport({ scale: 2 });
              const canvas = document.createElement('canvas');
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
      const response = await analyzeCGA(token, analysisText, source);
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
      <div className="dashboard-main">
        <h2 className="mb-4">📑 Analyse de CGA</h2>

        {quota && (
          <>
            <QuotaDisplay used={quota.used} limit={quota.limit} countdown={countdown} />
            {quota.limit !== -1 && quota.used >= quota.limit && (
              <div className="alert alert-warning">
                🚫 Quota atteint. Veuillez patienter jusqu’à minuit ou <a href="/upgrade">mettre à niveau</a>.
              </div>
            )}
          </>
        )}

        <AnalyzeForm
          onSubmit={handleAnalyze}
          loading={loading}
          ocrStatus={ocrStatus}
          quotaExceeded={quota ? quota.limit !== -1 && quota.used >= quota.limit : false}
        />

        {error && <div className="alert alert-danger mt-4">{error}</div>}

        {result && <ResultDisplay summary={result.summary} score={result.score} clauses={result.clauses} />}
      </div>
    </div>
  );
};

export default Analyze;
