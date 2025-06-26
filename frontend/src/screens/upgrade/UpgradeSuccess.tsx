//src/screens/Upgrade/UpgradeSuccess.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const UpgradeSuccess: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="simple-page">
      <h2>✅ {t('upgrade_success.title')}</h2>
      <p>{t('upgrade_success.message')}</p>
    </div>
  );
};

export default UpgradeSuccess;
