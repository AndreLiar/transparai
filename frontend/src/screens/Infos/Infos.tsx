//src/screens/infos/Infos.tsx
// src/screens/infos/Infos.tsx

import '@/styles/Layout.css';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData, InfoData } from '@/services/InfoService';
import Sidebar from '@/components/Layout/Sidebar';
import { deleteAccount } from '@/services/userService';
import './Infos.css';

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

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) return;
    try {
      const token = await user?.getIdToken();
      if (!token) {
        alert('Token non disponible, veuillez vous reconnecter.');
        return;
      }
      await deleteAccount(token);
      alert('Compte supprimé avec succès.');
      localStorage.setItem('logout-event', Date.now().toString());
      window.location.href = '/login';
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="infos-main">
        <div className="infos-heading">
          <h1>Informations utilisateur</h1>
          <p>Gérez votre plan, quota et compte depuis cet espace.</p>
        </div>

        {error && <div className="infos-error">{error}</div>}
        {!data && !error && <p className="infos-loading">Chargement...</p>}

        {data && (
          <>
            <section className="infos-card">
              <h2>👤 Compte</h2>
              <div className="infos-field">
                <span className="field-label">📧 Adresse e-mail</span>
                <span>{user?.email}</span>
              </div>
            </section>

            <section className="infos-card">
              <h2>💳 Abonnement</h2>
              <div className="infos-field">
                <span className="field-label">🪪 Plan actuel</span>
                <span>{data.plan}</span>
              </div>
              <div className="infos-field">
                <span className="field-label">📊 Quota utilisé</span>
                <span>{data.quota.used} / {data.quota.limit === -1 ? '∞ (illimité)' : data.quota.limit}</span>
              </div>
              <div className="infos-actions">
                <button onClick={handleDelete}>🗑 Supprimer mon compte</button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Infos;
