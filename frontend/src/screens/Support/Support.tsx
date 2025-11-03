// src/screens/Support/Support.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData, InfoData } from '@/services/InfoService';
import { getSupportInfo, sendPrioritySupport, SupportInfo, SupportRequest } from '@/services/supportService';
import Sidebar from '@/components/Layout/Sidebar';
import { useTranslation } from 'react-i18next';
import '@/styles/Layout.css';
import './Support.css';

const Support: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<InfoData | null>(null);
  const [supportInfo, setSupportInfo] = useState<SupportInfo | null>(null);
  const [supportForm, setSupportForm] = useState<SupportRequest>({
    subject: '',
    message: '',
    urgency: 'medium'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportSuccess, setSupportSuccess] = useState('');

  useEffect(() => {
    loadSupportData();
  }, [user, t]);

  const loadSupportData = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken(true);
      
      // Load both dashboard data and support info
      const [dashboardData, supportData] = await Promise.all([
        fetchDashboardData(token),
        getSupportInfo(token)
      ]);
      
      setData(dashboardData);
      setSupportInfo(supportData);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSupportSubmitting(true);
    setSupportSuccess('');
    setError('');

    try {
      const token = await user.getIdToken();
      const response = await sendPrioritySupport(token, supportForm);
      setSupportSuccess(`Demande envoyée ! Ticket: ${response.ticketId}. Réponse estimée: ${response.estimatedResponse}`);
      setSupportForm({ subject: '', message: '', urgency: 'medium' });
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de la demande');
    } finally {
      setSupportSubmitting(false);
    }
  };

  const handleSupportChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setSupportForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value as any
    }));
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="support-main">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Chargement des informations de support...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <button className="hamburger-toggle" onClick={() => setIsSidebarOpen(true)}>☰</button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="support-main">
        <div className="support-heading">
          <h1>
            {data?.plan === 'enterprise' ? '🏢 Support Enterprise Dédié' : '🚀 Support Prioritaire'}
          </h1>
          <p>
            {data?.plan === 'enterprise' 
              ? 'Accédez à votre support enterprise avec manager dédié et réponse ultra-rapide'
              : 'Contactez notre équipe de support pour une assistance prioritaire'
            }
          </p>
        </div>

        {error && <div className="support-error">{error}</div>}
        {supportSuccess && <div className="support-success">{supportSuccess}</div>}

        {/* Support Information Section */}
        {supportInfo && supportInfo.hasPrioritySupport && (
          <section className="support-card">
            <h2>📋 Informations de votre support</h2>
            <div className="support-info">
              <div className="support-features">
                <div className="support-feature">
                  <span className="feature-icon">⚡</span>
                  <div>
                    <h4>Temps de réponse garanti</h4>
                    <p>{supportInfo.features[data?.plan || 'free']?.responseTime}</p>
                  </div>
                </div>
                <div className="support-feature">
                  <span className="feature-icon">📧</span>
                  <div>
                    <h4>Canaux de support</h4>
                    <p>{supportInfo.features[data?.plan || 'free']?.support}</p>
                  </div>
                </div>
                {data?.plan === 'enterprise' && (
                  <div className="support-feature">
                    <span className="feature-icon">👨‍💼</span>
                    <div>
                      <h4>Manager de compte dédié</h4>
                      <p>Votre contact privilégié pour tous vos besoins</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Enterprise-specific features */}
              {data?.plan === 'enterprise' && supportInfo.features.enterprise?.features && (
                <div className="enterprise-features">
                  <h3>🏢 Avantages Enterprise inclus :</h3>
                  <ul className="enterprise-features-list">
                    {supportInfo.features.enterprise.features.map((feature, index) => (
                      <li key={index}>
                        <span className="feature-check">✅</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Support Contact Form */}
        {supportInfo && supportInfo.hasPrioritySupport && (
          <section className="support-card">
            <h2>📞 Contacter le support</h2>
            <form onSubmit={handleSupportSubmit} className="support-form">
              <div className="form-group">
                <label htmlFor="urgency">Niveau d'urgence</label>
                <select
                  id="urgency"
                  name="urgency"
                  value={supportForm.urgency}
                  onChange={handleSupportChange}
                  required
                >
                  <option value="low">Faible - Question générale</option>
                  <option value="medium">Moyen - Problème fonctionnel</option>
                  <option value="high">Élevé - Service indisponible</option>
                  {data?.plan === 'enterprise' && (
                    <option value="critical">🚨 CRITIQUE - Business impact majeur (15-30min)</option>
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="subject">Sujet</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={supportForm.subject}
                  onChange={handleSupportChange}
                  placeholder="Décrivez brièvement votre problème"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message détaillé</label>
                <textarea
                  id="message"
                  name="message"
                  value={supportForm.message}
                  onChange={handleSupportChange}
                  rows={6}
                  placeholder="Décrivez votre problème en détail..."
                  required
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary support-submit-btn"
                disabled={supportSubmitting}
              >
                {supportSubmitting ? 'Envoi en cours...' : 
                 data?.plan === 'enterprise' ? 'Contacter le support enterprise dédié' : 'Envoyer la demande prioritaire'}
              </button>
            </form>
          </section>
        )}

        {/* No Support Access */}
        {supportInfo && !supportInfo.hasPrioritySupport && (
          <section className="support-card">
            <h2>📧 Support Général</h2>
            <div className="no-priority-support">
              <p>Votre plan actuel ne donne pas accès au support prioritaire.</p>
              <div className="upgrade-suggestion">
                <h4>🚀 Débloquez le support prioritaire</h4>
                <p>Passez au plan Standard ou supérieur pour bénéficier de :</p>
                <ul>
                  <li>Réponse garantie sous 12-24h</li>
                  <li>Support par email direct</li>
                  <li>Priorité dans le traitement des demandes</li>
                </ul>
                <a href="/upgrade" className="btn btn-primary">
                  Découvrir nos plans
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Support;