// src/components/Analyze/AnalyzeForm.tsx
'use client';
import React, { useState } from 'react';
// Removed unused import to resolve the error
import * as pdfjsLib from 'pdfjs-dist';
(pdfjsLib as any).GlobalWorkerOptions.workerSrc = '/pdfjs/pdf.worker.mjs';

interface AnalyzeFormProps {
  onSubmit: (text: string, source: 'upload' | 'ocr', file: File | null) => void;
  loading: boolean;
  ocrStatus: string;
  quotaExceeded: boolean;
}

const AnalyzeForm: React.FC<AnalyzeFormProps> = ({
  onSubmit,
  loading,
  ocrStatus,
  quotaExceeded,
}) => {
  const [source, setSource] = useState<'upload' | 'ocr'>('upload');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(text, source, file);
  };

  return (
    <form onSubmit={handleSubmit}>
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

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading || quotaExceeded}
      >
        {loading ? 'Analyse en cours...' : 'Lancer l’analyse'}
      </button>
    </form>
  );
};

export default AnalyzeForm;
