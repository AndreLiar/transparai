//src/screens/infos/Infos.tsx
// src/screens/infos/Infos.tsx

import '@/styles/Layout.css';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData, InfoData } from '@/services/InfoService';
import Sidebar from '@/components/Layout/Sidebar';
import { deleteAccount } from '@/services/userService';
import { useTranslation } from 'react-i18next';
import './Infos.css';

const Infos: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
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
        setError(err.message || t('infos.unknown_error'));
      }
    };
    loadInfos();
  }, [user, t]);

  const handleDelete = async () => {
    if (!confirm(t('infos.confirm_delete'))) return;
    try {
      const token = await user?.getIdToken();
      if (!token) {
        alert(t('infos.token_error'));
        return;
      }
      await deleteAccount(token);
      alert(t('infos.delete_success'));
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
          <h1>{t('infos.title')}</h1>
          <p>{t('infos.subtitle')}</p>
        </div>

        {error && <div className="infos-error">{error}</div>}
        {!data && !error && <p className="infos-loading">{t('infos.loading')}</p>}

        {data && (
          <>
            <section className="infos-card">
              <h2>👤 {t('infos.account')}</h2>
              <div className="infos-field">
                <span className="field-label">📧 {t('infos.email')}</span>
                <span>{user?.email}</span>
              </div>
            </section>

            <section className="infos-card">
              <h2>💳 {t('infos.subscription')}</h2>
              <div className="infos-field">
                <span className="field-label">🪪 {t('infos.plan')}</span>
                <span>{data.plan}</span>
              </div>
              <div className="infos-field">
                <span className="field-label">📊 {t('infos.quota')}</span>
                <span>
                  {data.quota.used} /{' '}
                  {data.quota.limit === -1 ? `∞ (${t('infos.unlimited')})` : data.quota.limit}
                </span>
              </div>
              <div className="infos-actions">
                <button onClick={handleDelete}>🗑 {t('infos.delete_account')}</button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Infos;

