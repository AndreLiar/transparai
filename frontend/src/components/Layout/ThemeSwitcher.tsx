import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="theme-switcher">
      <button onClick={() => setTheme('light')} disabled={theme === 'light'}>🌞</button>
      <button onClick={() => setTheme('dark')} disabled={theme === 'dark'}>🌙</button>
      <button onClick={() => setTheme('system')} disabled={theme === 'system'}>💻</button>
    </div>
  );
};

export default ThemeSwitcher;
