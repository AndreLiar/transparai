// src/components/Analyze/QuotaDisplay.tsx
import React from 'react';

interface QuotaDisplayProps {
  used: number;
  limit: number;
  countdown: string;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ used, limit, countdown }) => {
  const percentage = limit === -1 ? 0 : (used / limit) * 100;

  return (
    <div className="mb-4">
      <p><strong>🔄 Quota :</strong> {used} / {limit === -1 ? '∞' : limit} analyses utilisées</p>
      {limit !== -1 && (
        <>
          <div className="progress" style={{ height: '20px' }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${percentage}%` }}
              aria-valuenow={used}
              aria-valuemin={0}
              aria-valuemax={limit}
            >
              {percentage.toFixed(0)}%
            </div>
          </div>
          <p className="text-muted mt-1">⏳ Réinitialisation du quota dans {countdown}</p>
        </>
      )}
    </div>
  );
};

export default QuotaDisplay;
