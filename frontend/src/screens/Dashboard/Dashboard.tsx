// src/screens/Dashboard.tsx
import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Smiley } from 'phosphor-react';
import './Dashboard.css';
import '@/styles/Layout.css';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] || 'Utilisateur';

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dashboard-main">
        <div className="dashboard-hero">
          <Smiley size={42} weight="duotone" className="hero-icon" />
          <h1 className="hero-title">Bonjour, <span className="highlight">{firstName} 👋</span></h1>
          <p className="hero-subtitle">Bienvenue dans votre espace personnel TransparAI.</p>
          <p className="hero-callout">🧭 Choisissez une action à gauche pour commencer.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
