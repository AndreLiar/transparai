// src/components/Analyze/ResultDisplay.tsx
import React from 'react';

interface ResultDisplayProps {
  summary: string;
  score: string;
  clauses: string[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ summary, score, clauses }) => {
  return (
    <div className="mt-4">
      <h5>✅ Résultat</h5>
      <p><strong>Résumé :</strong> {summary}</p>
      <p><strong>Score :</strong> {score}</p>
      <p><strong>Clauses :</strong></p>
      <ul>
        {clauses.map((clause, i) => (
          <li key={i}>{clause}</li>
        ))}
      </ul>
    </div>
  );
};

export default ResultDisplay;
