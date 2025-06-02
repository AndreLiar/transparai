// src/screens/Dashboard/Dashboard.tsx
// src/screens/Dashboard/Dashboard.tsx
import React from 'react';
import Sidebar from '@/components/Layout/Sidebar';

const Dashboard: React.FC = () => {
  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      <Sidebar />
      <div className="flex-grow-1 p-5">
        <h2>🎛️ Bienvenue sur votre Dashboard</h2>
        <p>Choisissez une option dans le menu pour commencer.</p>
      </div>
    </div>
  );
};

export default Dashboard;
