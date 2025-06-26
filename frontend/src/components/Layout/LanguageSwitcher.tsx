// src/components/Layout/LanguageSwitcher.tsx


import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher">
      <button onClick={() => changeLanguage('fr')}>🇫🇷</button>
      <button onClick={() => changeLanguage('en')}>🇬🇧</button>
    </div>
  );
};

export default LanguageSwitcher;
