// src/services/analyze.ts

const API_BASE = () =>
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5001';

export type AnalysisProgress = {
  type: 'progress';
  step: string;
  message: string;
  percent: number;
};

export type AnalysisResult = {
  summary: string;
  score: string;
  clauses: string[];
  analysisId?: string;
  canExportPdf?: boolean;
  remaining?: number;
  quotaReached?: boolean;
  aiModelUsed?: string;
  confidenceLevel?: 'high' | 'medium' | 'low';
  requiresHumanReview?: boolean;
  promptVersion?: string;
  disclaimerVersion?: string;
  jurisdiction?: string;
  chunked?: boolean;
  chunkCount?: number;
};

export type AnalysisError = {
  type: 'error';
  message: string;
  status?: number;
  code?: string;
  consentRequired?: boolean;
  upgradeRequired?: boolean;
  currentPlan?: string;
  quotaReached?: boolean;
};

/**
 * Stream an analysis request using SSE.
 * Calls onProgress for each progress event, resolves with the final result.
 * Rejects with an AnalysisError on any error event.
 *
 * Uses fetch + ReadableStream so no external library needed.
 */
export const analyzeCGAStream = (
  token: string,
  text: string,
  source: string,
  onProgress: (progress: AnalysisProgress) => void,
): Promise<AnalysisResult> => {
  return new Promise(async (resolve, reject) => {
    let response: Response;
    try {
      response = await fetch(`${API_BASE()}/api/analyze/stream`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, source }),
      });
    } catch (err: any) {
      return reject({ type: 'error', message: err.message || 'Erreur réseau', status: 0 });
    }

    if (!response.ok || !response.body) {
      return reject({ type: 'error', message: 'Analyse échouée', status: response.status });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    const processChunk = (chunk: string) => {
      // SSE lines are "data: {...}\n\n" — split and parse each event
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const raw = line.slice(6).trim();
        if (!raw) continue;

        let event: any;
        try {
          event = JSON.parse(raw);
        } catch {
          continue;
        }

        if (event.type === 'progress') {
          onProgress(event as AnalysisProgress);
        } else if (event.type === 'result') {
          resolve(event.data as AnalysisResult);
        } else if (event.type === 'error') {
          reject(event as AnalysisError);
        }
      }
    };

    // Read the stream
    const pump = async () => {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        // Process complete SSE messages (terminated by \n\n)
        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';
        for (const part of parts) {
          processChunk(part);
        }
      }
      // Process any remaining buffer
      if (buffer) processChunk(buffer);
    };

    pump().catch((err) =>
      reject({ type: 'error', message: err.message || 'Stream error', status: 0 }),
    );
  });
};

// Legacy non-streaming endpoint — kept for fallback
export const analyzeCGA = async (token: string, text: string, source: 'upload' | 'ocr') => {
  const response = await fetch(`${API_BASE()}/api/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, source }),
  });

  if (response.status === 429) {
    const data = await response.json();
    return { quotaReached: true, message: data.message };
  }

  if (!response.ok) {
    throw new Error('Analyse échouée');
  }

  return response.json();
};
