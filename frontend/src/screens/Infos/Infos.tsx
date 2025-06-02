import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData, InfoData } from '@/services/InfoService';

const Infos: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<InfoData | null>(null);
  const [error, setError] = useState('');

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
    <div className="container mt-5">
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
            <strong>Quota utilisé :</strong> {data.quota.used} / {data.quota.limit}
          </p>
        </div>
      )}
    </div>
  );
};

export default Infos;
