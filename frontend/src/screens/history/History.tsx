//src/screens/history/History.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import { fetchDashboardData } from '@/services/InfoService';
import { fetchUserAnalyses, Analysis } from '@/services/historyService';
import { exportAnalysisPdf } from '@/services/export';
import { useNavigate } from 'react-router-dom';

const History: React.FC = () => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  //const [loading, setLoading] = useState(false);
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

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="dashboard-main">
        <h2 className="mb-4">📚 Historique des analyses</h2>

        {error && <div className="alert alert-danger">{error}</div>}

        {plan === 'starter' && (
          <div className="alert alert-info">
            🚫 Historique réservé aux abonnés payants. <a onClick={() => navigate('/upgrade')}>Passez à un plan payant</a>.
          </div>
        )}

        {plan !== 'starter' && analyses.length === 0 && <p>Aucune analyse trouvée.</p>}

        {plan !== 'starter' && analyses.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Résumé</th>
                <th>Score</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((a) => (
                <tr key={a._id}>
                  <td>{new Date(a.date).toLocaleDateString()}</td>
                  <td>{a.summary.slice(0, 40)}...</td>
                  <td>{a.score}</td>
                  <td>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => handleExport(a._id)}>
                      Exporter en PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>
    </div>
  );
};

export default History;
