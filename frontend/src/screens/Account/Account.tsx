// src/screens/Account/Account.tsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData, InfoData } from '@/services/InfoService';
import { getProfile, updateProfile, ProfileData } from '@/services/profileService';
import { deleteAccount } from '@/services/userService';
import Sidebar from '@/components/Layout/Sidebar';
import { useTranslation } from 'react-i18next';
import '@/styles/Layout.css';
import './Account.css';

const Account: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [data, setData] = useState<InfoData | null>(null);
  const [, setProfileData] = useState<ProfileData | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    country: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    loadAccountData();
  }, [user, t]);

  const loadAccountData = async () => {
    if (!user) return;
    
    try {
      const token = await user.getIdToken(true);
      
      // Load both info and profile data
      const [infos, profile] = await Promise.all([
        fetchDashboardData(token),
        getProfile(token)
      ]);
      
      setData(infos);
      setProfileData(profile);
      setFormData({
        firstName: profile.profile.firstName,
        lastName: profile.profile.lastName,
        phone: profile.profile.phone,
        country: profile.profile.country
      });
    } catch (err: any) {
      setError(err.message || t('account.load_error'));
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = await user.getIdToken();
      await updateProfile(token, formData);
      setSuccess(t('account.profile_update_success'));
    } catch (err: any) {
      setError(err.message || t('account.profile_update_error'));
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleDelete = async () => {
    if (!confirm(t('account.confirm_delete'))) return;
    try {
      const token = await user?.getIdToken();
      if (!token) {
        alert(t('account.token_error'));
        return;
      }
      await deleteAccount(token);
      alert(t('account.delete_success'));
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

      <main className="account-main">
        <div className="account-heading">
          <h1>{t('account.title')}</h1>
          <p>{t('account.subtitle')}</p>
        </div>

        {error && <div className="account-error">{error}</div>}
        {success && <div className="account-success">{success}</div>}
        
        {loading ? (
          <p className="account-loading">{t('account.loading')}</p>
        ) : (
          <>
            {/* Account Information Section */}
            <section className="account-card">
              <h2>👤 {t('account.account_info')}</h2>
              <div className="account-field">
                <span className="field-label">📧 {t('account.email')}</span>
                <span>{user?.email}</span>
              </div>
            </section>

            {/* Subscription Information Section */}
            {data && (
              <section className="account-card">
                <h2>💳 {t('account.subscription')}</h2>
                <div className="account-field">
                  <span className="field-label">🪪 {t('account.plan')}</span>
                  <div className="plan-info">
                    <span className={`plan-badge plan-${data.plan}`}>
                      {(data.plan === 'free' || data.plan === 'starter') && '🆓 Gratuit'}
                      {data.plan === 'standard' && '⭐ Standard'}
                      {data.plan === 'premium' && '👑 Premium'}
                      {data.plan === 'enterprise' && '🏢 Enterprise'}
                    </span>
                    {data.plan === 'standard' && (
                      <span className="feature-badge priority-support">
                        🚀 Support prioritaire
                      </span>
                    )}
                    {data.plan === 'premium' && (
                      <span className="feature-badge unlimited">
                        ♾️ Analyses illimitées
                      </span>
                    )}
                    {data.plan === 'enterprise' && (
                      <>
                        <span className="feature-badge unlimited">
                          ♾️ Analyses illimitées
                        </span>
                        <span className="feature-badge enterprise">
                          👥 Multi-utilisateurs
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="account-field">
                  <span className="field-label">📊 {t('account.quota')}</span>
                  <span>
                    {data.quota.used} /{' '}
                    {data.quota.limit === -1 ? `∞ (${t('account.unlimited')})` : `${data.quota.limit} ${t('account.this_month')}`}
                  </span>
                </div>
                
                {/* Plan Features */}
                <div className="plan-features">
                  <h3>Fonctionnalités incluses :</h3>
                  <ul className="features-list">
                    {(data.plan === 'free' || data.plan === 'starter') && (
                      <>
                        <li>✅ 20 analyses par mois</li>
                        <li>❌ Pas de sauvegarde d'historique</li>
                        <li>❌ Pas d'export PDF</li>
                      </>
                    )}
                    {data.plan === 'standard' && (
                      <>
                        <li>✅ 40 analyses par mois</li>
                        <li>✅ Historique des analyses sauvegardé</li>
                        <li>✅ Export PDF des analyses</li>
                        <li>✅ Support prioritaire par email</li>
                      </>
                    )}
                    {data.plan === 'premium' && (
                      <>
                        <li>✅ Analyses illimitées</li>
                        <li>✅ Historique complet sauvegardé</li>
                        <li>✅ Export PDF et JSON</li>
                        <li>✅ Support dédié prioritaire</li>
                        <li>✅ Accès anticipé aux nouvelles fonctionnalités</li>
                      </>
                    )}
                    {data.plan === 'enterprise' && (
                      <>
                        <li>✅ Analyses illimitées</li>
                        <li>✅ Gestion multi-utilisateurs avec rôles</li>
                        <li>✅ Système d'invitations & permissions granulaires</li>
                        <li>✅ Analyse comparative multi-documents (jusqu'à 5)</li>
                        <li>✅ Tableaux de bord analytiques avancés</li>
                        <li>✅ Journal d'audit complet avec traçabilité</li>
                        <li>✅ Personnalisation de la marque</li>
                        <li>✅ Support technique dédié & formation équipe</li>
                      </>
                    )}
                  </ul>
                </div>
              </section>
            )}

            {/* Profile Management Section */}
            <section className="account-card">
              <h2>✏️ {t('account.profile_info')}</h2>
              <form onSubmit={handleSubmit} className="account-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName">{t('account.first_name')} *</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder={t('account.first_name_placeholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName">{t('account.last_name')} *</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      placeholder={t('account.last_name_placeholder')}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">{t('account.phone')}</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('account.phone_placeholder')}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country">{t('account.country')}</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="">{t('account.select_country')}</option>
                      <option value="FR">France</option>
                      <option value="BE">Belgique</option>
                      <option value="CH">Suisse</option>
                      <option value="CA">Canada</option>
                      <option value="US">États-Unis</option>
                      <option value="DE">Allemagne</option>
                      <option value="ES">Espagne</option>
                      <option value="IT">Italie</option>
                      <option value="UK">Royaume-Uni</option>
                      <option value="OTHER">{t('account.other_country')}</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving ? t('account.saving') : t('account.save_profile')}
                  </button>
                </div>
              </form>
            </section>


            {/* Account Actions Section */}
            <section className="account-card account-danger">
              <h2>⚠️ {t('account.danger_zone')}</h2>
              <p className="danger-description">{t('account.danger_description')}</p>
              <div className="account-actions">
                <button 
                  onClick={handleDelete}
                  className="btn-danger"
                >
                  🗑 {t('account.delete_account')}
                </button>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Account;