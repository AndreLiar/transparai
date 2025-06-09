// src/components/Analyze/ResultDisplay.tsx
import React from 'react';
import './ResultDisplay.css';

interface ResultDisplayProps {
  summary: string;
  score: string;
  clauses: string[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ summary, score, clauses }) => {
  return (
    <div className="result-container">
      <div className="result-header">
        <span className="result-icon">📊</span>
        <div>
          <h3>Résultat de l’analyse</h3>
          <p className="result-subtitle">Analyse synthétique du document soumis</p>
        </div>
      </div>

      <div className="result-block">
        <h4>Résumé</h4>
        <p className="result-text">{summary}</p>
      </div>

      <div className="result-block">
        <h4>Score</h4>
        <div className="score-box">
          <span>{score}</span>
        </div>
      </div>

      <div className="result-block">
        <h4>Clauses importantes</h4>
        <ul className="clause-list">
          {clauses.map((clause, i) => (
            <li key={i}>{clause}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ResultDisplay;
