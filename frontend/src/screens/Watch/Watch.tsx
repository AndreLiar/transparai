// src/screens/Watch/Watch.tsx
// The habit-loop dashboard: shows all watched documents and their change history.
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Layout/Sidebar';
import {
  getWatches,
  deleteWatch,
  updateWatch,
  getWatchHistory,
  WatchedDocument,
  DocumentChange,
} from '@/services/watchService';
import './Watch.css';

const RISK_BADGE: Record<string, string> = {
  low: 'risk-low',
  medium: 'risk-medium',
  high: 'risk-high',
  critical: 'risk-critical',
};

const RISK_LABEL: Record<string, string> = {
  low: 'Faible',
  medium: 'Modéré',
  high: 'Élevé',
  critical: 'Critique',
};

const Watch: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [watches, setWatches] = useState<WatchedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWatch, setSelectedWatch] = useState<string | null>(null);
  const [history, setHistory] = useState<DocumentChange[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadWatches = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const token = await user.getIdToken();
      const data = await getWatches(token);
      setWatches(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatches();
  }, [user]);

  const loadHistory = async (watchId: string) => {
    if (!user) return;
    setSelectedWatch(watchId);
    setHistoryLoading(true);
    setHistory([]);
    try {
      const token = await user.getIdToken();
      const data = await getWatchHistory(token, watchId);
      setHistory(data.changes);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleDelete = async (watchId: string) => {
    if (!user || !confirm('Arrêter la surveillance de ce document ?')) return;
    try {
      const token = await user.getIdToken();
      await deleteWatch(token, watchId);
      if (selectedWatch === watchId) {
        setSelectedWatch(null);
        setHistory([]);
      }
      setWatches((prev) => prev.filter((w) => w._id !== watchId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleAlerts = async (watch: WatchedDocument) => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const updated = await updateWatch(token, watch._id, { alertsEnabled: !watch.alertsEnabled });
      setWatches((prev) => prev.map((w) => (w._id === watch._id ? updated : w)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleFrequencyChange = async (watch: WatchedDocument, freq: 'weekly' | 'monthly') => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const updated = await updateWatch(token, watch._id, { checkFrequency: freq });
      setWatches((prev) => prev.map((w) => (w._id === watch._id ? updated : w)));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="watch-main">
        <h1 className="watch-title">👁️ Documents Surveillés</h1>
        <p className="watch-subtitle">
          TransparAI surveille ces documents et vous alerte dès qu'une modification est détectée.
        </p>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="watch-loading">Chargement...</div>
        ) : watches.length === 0 ? (
          <div className="watch-empty">
            <div className="watch-empty-icon">👁️</div>
            <h3>Aucun document surveillé</h3>
            <p>
              Analysez un document et cliquez sur <strong>"Surveiller ce document"</strong> pour commencer
              à recevoir des alertes automatiques en cas de modification.
            </p>
          </div>
        ) : (
          <div className="watch-layout">
            {/* Left: watch list */}
            <div className="watch-list">
              {watches.map((watch) => (
                <div
                  key={watch._id}
                  className={`watch-card ${selectedWatch === watch._id ? 'watch-card--selected' : ''}`}
                  onClick={() => loadHistory(watch._id)}
                >
                  <div className="watch-card-header">
                    <h4 className="watch-card-name">{watch.name}</h4>
                    {watch.changeCount > 0 && (
                      <span className="watch-badge">{watch.changeCount} modification{watch.changeCount > 1 ? 's' : ''}</span>
                    )}
                  </div>

                  <div className="watch-card-meta">
                    <span>Dernière vérification : {formatDate(watch.lastCheckedAt)}</span>
                    {watch.lastChangedAt && (
                      <span className="watch-last-change">Dernier changement : {formatDate(watch.lastChangedAt)}</span>
                    )}
                  </div>

                  {watch.lastScore && (
                    <span className={`watch-score score-${watch.lastScore.toLowerCase()}`}>
                      {watch.lastScore}
                    </span>
                  )}

                  <div className="watch-card-controls" onClick={(e) => e.stopPropagation()}>
                    <label className="watch-toggle-label">
                      <input
                        type="checkbox"
                        checked={watch.alertsEnabled}
                        onChange={() => handleToggleAlerts(watch)}
                      />
                      Alertes email
                    </label>

                    <select
                      value={watch.checkFrequency}
                      onChange={(e) => handleFrequencyChange(watch, e.target.value as 'weekly' | 'monthly')}
                      className="watch-freq-select"
                    >
                      <option value="weekly">Hebdomadaire</option>
                      <option value="monthly">Mensuel</option>
                    </select>

                    <button
                      className="watch-delete-btn"
                      onClick={() => handleDelete(watch._id)}
                      title="Arrêter la surveillance"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: change history */}
            <div className="watch-history-panel">
              {!selectedWatch ? (
                <div className="watch-history-empty">
                  <p>Sélectionnez un document pour voir l'historique des modifications.</p>
                </div>
              ) : historyLoading ? (
                <div className="watch-loading">Chargement de l'historique...</div>
              ) : history.length === 0 ? (
                <div className="watch-history-empty">
                  <p>Aucune modification détectée pour l'instant.</p>
                  <p className="watch-hint">TransparAI vérifie automatiquement selon votre fréquence choisie.</p>
                </div>
              ) : (
                <div className="watch-changes">
                  <h3>Historique des modifications</h3>
                  {history.map((change) => (
                    <div key={change._id} className="change-card">
                      <div className="change-header">
                        <span className={`risk-badge ${RISK_BADGE[change.riskLevel]}`}>
                          {RISK_LABEL[change.riskLevel]}
                        </span>
                        <span className="change-date">{formatDate(change.detectedAt)}</span>
                      </div>

                      {(change.previousScore || change.newScore) && (
                        <div className="change-score">
                          Score : <strong>{change.previousScore}</strong> → <strong>{change.newScore}</strong>
                        </div>
                      )}

                      <p className="change-summary">{change.diffSummary}</p>

                      {change.addedClauses.length > 0 && (
                        <div className="change-clauses change-clauses--added">
                          <h5>Nouvelles clauses</h5>
                          <ul>
                            {change.addedClauses.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {change.removedClauses.length > 0 && (
                        <div className="change-clauses change-clauses--removed">
                          <h5>Clauses supprimées</h5>
                          <ul>
                            {change.removedClauses.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Watch;
