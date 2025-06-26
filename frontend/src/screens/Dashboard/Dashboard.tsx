// src/screens/Dashboard.tsx
import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Smiley } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import './Dashboard.css';
import '@/styles/Layout.css';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const firstName = user?.displayName?.split(' ')[0] || t('dashboard.default_user');

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <Smiley size={42} weight="duotone" className="hero-icon" />
          <h1 className="hero-title">
            {t('dashboard.greeting')}, <span className="highlight">{firstName} 👋</span>
          </h1>
          <p className="hero-subtitle">{t('dashboard.welcome')}</p>
          <p className="hero-callout">🧭 {t('dashboard.call_to_action')}</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

