//src/screens/Upgrade/Upgradecancel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const UpgradeCancel: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="simple-page">
      <h2>❌ {t('upgrade_cancel.title')}</h2>
      <p>{t('upgrade_cancel.message')}</p>
    </div>
  );
};

export default UpgradeCancel;
