//src/components/Analyze/ResultDisplay.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import './ResultDisplay.css';

interface ResultDisplayProps {
  summary: string;
  score: string;
  clauses: string[];
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ summary, score, clauses }) => {
  const { t } = useTranslation();

  return (
    <div className="result-container">
      <div className="result-header">
        <span className="result-icon">📊</span>
        <div>
          <h3>{t('result_title')}</h3>
          <p className="result-subtitle">{t('result_subtitle')}</p>
        </div>
      </div>

      <div className="result-block">
        <h4>{t('summary')}</h4>
        <p className="result-text">{summary}</p>
      </div>

      <div className="result-block">
        <h4>{t('score')}</h4>
        <div className="score-box">
          <span>{score}</span>
        </div>
      </div>

      <div className="result-block">
        <h4>{t('important_clauses')}</h4>
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
