import React from 'react';
import { useTranslation } from 'react-i18next';

interface QuotaDisplayProps {
  used: number;
  limit: number;
  countdown: string;
}

const QuotaDisplay: React.FC<QuotaDisplayProps> = ({ used, limit, countdown }) => {
  const { t } = useTranslation();
  const percentage = limit === -1 ? 0 : (used / limit) * 100;

  return (
    <div className="mb-4">
      <p>
        <strong>🔄 {t('quota_label')}:</strong>{' '}
        {used} / {limit === -1 ? '∞' : limit} {t('quota_analyses_used')}
      </p>
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
          <p className="text-muted mt-1">
            ⏳ {t('quota_reset_in', { countdown })}
          </p>
        </>
      )}
    </div>
  );
};

export default QuotaDisplay;
