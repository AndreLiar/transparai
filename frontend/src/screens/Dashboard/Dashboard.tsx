// Dashboard.tsx
import React, { useState } from 'react';
import Sidebar from '@/components/Layout/Sidebar';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="dashboard-main">
        <h2>Bienvenue sur votre Dashboard</h2>
        <p>Choisissez une option dans le menu pour commencer.</p>
      </div>
    </div>
  );
};

export default Dashboard;
