import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { analyzeCGA } from '@/services/analyze';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

// PDF.js types
type TextItem = { str: string };
type TextContent = { items: Array<TextItem | { type: string }> };

const Analyze: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [source, setSource] = useState<'upload' | 'ocr'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState<{
    summary: string;
    score: string;
    clauses: string[];
  } | null>(null);

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

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

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
            console.warn('PDF extraction échouée, passage à OCR...');
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let ocrText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const viewport = page.getViewport({ scale: 2 });
              const canvas = document.createElement('canvas');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              await page.render({
                canvasContext: canvas.getContext('2d')!,
                viewport,
              }).promise;

              const dataUrl = canvas.toDataURL('image/png');
              ocrText += '\n' + (await extractTextWithOCR(dataUrl));
            }

            analysisText = ocrText.trim();
          }
        } else {
          analysisText = await extractTextWithOCR(file);
        }

        setText(analysisText); // optional preview
      }

      const token = await user.getIdToken(true);
      const response = await analyzeCGA(token, analysisText, source);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
      setOcrStatus('');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">📑 Analyse de CGA</h2>
      <form onSubmit={handleAnalyze}>
        <div className="mb-3">
          <label className="form-label">Source</label>
          <select
            className="form-select"
            value={source}
            onChange={(e) => setSource(e.target.value as 'upload' | 'ocr')}
          >
            <option value="upload">Texte (copier-coller)</option>
            <option value="ocr">OCR (image/PDF)</option>
          </select>
        </div>

        {source === 'upload' && (
          <div className="mb-3">
            <label className="form-label">Texte CGA à analyser</label>
            <textarea
              className="form-control"
              rows={6}
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
            />
          </div>
        )}

        {source === 'ocr' && (
          <div className="mb-3">
            <label className="form-label">📄 Fichier image ou PDF</label>
            <input
              type="file"
              accept="image/*,.pdf"
              className="form-control"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
          </div>
        )}

        {ocrStatus && <div className="alert alert-info">{ocrStatus}</div>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Analyse en cours...' : 'Lancer l’analyse'}
        </button>
      </form>

      {error && <div className="alert alert-danger mt-4">{error}</div>}

      {result && (
        <div className="mt-4">
          <h5>✅ Résultat</h5>
          <p><strong>Résumé :</strong> {result.summary}</p>
          <p><strong>Score :</strong> {result.score}</p>
          <p><strong>Clauses :</strong></p>
          <ul>
            {result.clauses.map((clause, i) => (
              <li key={i}>{clause}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Analyze;
