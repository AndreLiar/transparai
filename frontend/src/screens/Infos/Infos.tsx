//src/screens/infos/Infos.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData, InfoData } from '@/services/InfoService';
import Sidebar from '@/components/Layout/Sidebar';
import '@/components/Layout/Sidebar.css';

const Infos: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<InfoData | null>(null);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const loadInfos = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken(true);
        const infos = await fetchDashboardData(token);
        setData(infos);
      } catch (err: any) {
        setError(err.message || 'Erreur inconnue');
      }
    };

    loadInfos();
  }, [user]);

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="dashboard-main">
        <h2 className="mb-4">🧾 Informations utilisateur</h2>
        {error && <div className="alert alert-danger">{error}</div>}
        {!data && !error && <p>Chargement...</p>}
        {data && (
          <div className="card p-4">
            <p>
              <strong>Adresse e-mail :</strong> {user?.email}
            </p>
            <p>
              <strong>Plan actuel :</strong> {data.plan}
            </p>
            <p>
              <strong>Quota utilisé :</strong> {data.quota.used} / {data.quota.limit === -1 ? '∞' : data.quota.limit}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Infos;
