// src/services/analyze.ts
export const analyzeCGA = async (token: string, text: string, source: 'upload' | 'ocr') => {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, source }),
    });
  
    if (!response.ok) {
      throw new Error('Analyse échouée');
    }
  
    return response.json(); // { summary, score, clauses }
  };
  