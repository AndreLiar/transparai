//src/screens/history/History.tsx
// src/screens/history/History.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import { fetchDashboardData } from '@/services/InfoService';
import { fetchUserAnalyses, Analysis } from '@/services/historyService';
import { exportAnalysisPdf } from '@/services/export';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '@/styles/Layout.css';
import './History.css';

const PAGE_SIZE = 2;

const History: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [plan, setPlan] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        const infos = await fetchDashboardData(token);
        setPlan(infos.plan);

        if (infos.plan !== 'starter') {
          const data = await fetchUserAnalyses(token);
          setAnalyses(data);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };
    loadData();
  }, [user]);

  const handleExport = async (id: string) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const pdfBlob = await exportAnalysisPdf(token, id);
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analyse_${id}.pdf`;
      a.click();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedAnalyses = analyses.slice(startIndex, startIndex + PAGE_SIZE);
  const totalPages = Math.ceil(analyses.length / PAGE_SIZE);

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="history-main">
        <h2 className="history-heading">📚 {t('history.title')}</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {plan === 'starter' && (
          <div className="alert alert-info">
            🚫 {t('history.paid_only')}{' '}
            <a onClick={() => navigate('/upgrade')}>{t('history.upgrade_link')}</a>.
          </div>
        )}

        {plan !== 'starter' && analyses.length === 0 && (
          <p>{t('history.no_analysis')}</p>
        )}

        {plan !== 'starter' && paginatedAnalyses.length > 0 && (
          <div className="history-list">
            {paginatedAnalyses.map((a) => (
              <div className="history-card" key={a._id}>
                <div className="history-card-header">
                  <span className="history-date">{new Date(a.date).toLocaleDateString()}</span>
                  <span className={`history-score score-${a.score}`}>
                    {a.score.charAt(0).toUpperCase() + a.score.slice(1)}
                  </span>
                </div>
                <p className="history-summary">{a.summary}</p>
                <button className="btn export-btn" onClick={() => handleExport(a._id)}>
                  📥 {t('history.export_pdf')}
                </button>
              </div>
            ))}

            {totalPages > 1 && (
              <div className="pagination">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`page-btn ${page === currentPage ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default History;
