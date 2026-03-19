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
      <button className="hamburger-toggle ac-hamburger" onClick={() => setIsSidebarOpen(true)}>
        <span className="ac-hamburger-bar" />
        <span className="ac-hamburger-bar" />
        <span className="ac-hamburger-bar" />
      </button>
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <main className="account-main ac-main">
        <div className="ac-page-header">
          <h1 className="ac-page-title">Mon compte</h1>
          <p className="ac-page-subtitle">{t('account.subtitle')}</p>
          <div className="ac-header-rule" />
        </div>

        {error && <div className="ac-alert ac-alert--error">{error}</div>}
        {success && <div className="ac-alert ac-alert--success">{success}</div>}

        {loading ? (
          <p className="ac-loading">{t('account.loading')}</p>
        ) : (
          <>
            {/* Account Information */}
            <section className="ac-section">
              <div className="ac-section-head">
                <span className="ac-section-label">Informations du compte</span>
                <div className="ac-section-rule" />
              </div>
              <div className="ac-field-row">
                <span className="ac-field-label">{t('account.email')}</span>
                <span className="ac-field-value">{user?.email}</span>
              </div>
            </section>

            {/* Subscription */}
            {data && (
              <section className="ac-section">
                <div className="ac-section-head">
                  <span className="ac-section-label">Abonnement</span>
                  <div className="ac-section-rule" />
                </div>

                <div className="ac-field-row">
                  <span className="ac-field-label">{t('account.plan')}</span>
                  <div className="ac-plan-info">
                    <span className={`ac-plan-badge ac-plan-badge--${data.plan}`}>
                      {(data.plan === 'free' || data.plan === 'starter') && 'Gratuit'}
                      {data.plan === 'standard' && 'Standard'}
                      {data.plan === 'premium' && 'Premium'}
                      {data.plan === 'enterprise' && 'Enterprise'}
                    </span>
                  </div>
                </div>

                <div className="ac-field-row">
                  <span className="ac-field-label">{t('account.quota')}</span>
                  <span className="ac-field-value">
                    {data.quota.used} /{' '}
                    {data.quota.limit === -1 ? `∞ (${t('account.unlimited')})` : `${data.quota.limit} ${t('account.this_month')}`}
                  </span>
                </div>

                <div className="ac-features">
                  <span className="ac-features-label">Fonctionnalités incluses</span>
                  <ul className="ac-features-list">
                    {(data.plan === 'free' || data.plan === 'starter') && (
                      <>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> 20 analyses par mois</li>
                        <li className="ac-feature ac-feature--no"><span className="ac-feature-mark">&#8212;</span> Pas de sauvegarde d'historique</li>
                        <li className="ac-feature ac-feature--no"><span className="ac-feature-mark">&#8212;</span> Pas d'export PDF</li>
                      </>
                    )}
                    {data.plan === 'standard' && (
                      <>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> 40 analyses par mois</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Historique des analyses sauvegardé</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Export PDF des analyses</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Support prioritaire par email</li>
                      </>
                    )}
                    {data.plan === 'premium' && (
                      <>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Analyses illimitées</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Historique complet sauvegardé</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Export PDF et JSON</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Support dédié prioritaire</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Accès anticipé aux nouvelles fonctionnalités</li>
                      </>
                    )}
                    {data.plan === 'enterprise' && (
                      <>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Analyses illimitées</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Gestion multi-utilisateurs avec rôles</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Système d'invitations &amp; permissions granulaires</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Analyse comparative multi-documents</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Tableaux de bord analytiques avancés</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Journal d'audit complet avec traçabilité</li>
                        <li className="ac-feature ac-feature--ok"><span className="ac-feature-mark">&#10003;</span> Support technique dédié &amp; formation équipe</li>
                      </>
                    )}
                  </ul>
                </div>
              </section>
            )}

            {/* Profile */}
            <section className="ac-section">
              <div className="ac-section-head">
                <span className="ac-section-label">{t('account.profile_info')}</span>
                <div className="ac-section-rule" />
              </div>
              <form onSubmit={handleSubmit} className="ac-form">
                <div className="ac-form-row">
                  <div className="ac-form-group">
                    <label className="ac-input-label" htmlFor="firstName">{t('account.first_name')} *</label>
                    <input
                      className="ac-input"
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      placeholder={t('account.first_name_placeholder')}
                    />
                  </div>
                  <div className="ac-form-group">
                    <label className="ac-input-label" htmlFor="lastName">{t('account.last_name')} *</label>
                    <input
                      className="ac-input"
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
                <div className="ac-form-row">
                  <div className="ac-form-group">
                    <label className="ac-input-label" htmlFor="phone">{t('account.phone')}</label>
                    <input
                      className="ac-input"
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('account.phone_placeholder')}
                    />
                  </div>
                  <div className="ac-form-group">
                    <label className="ac-input-label" htmlFor="country">{t('account.country')}</label>
                    <select className="ac-input" id="country" name="country" value={formData.country} onChange={handleChange}>
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
                <div className="ac-form-actions">
                  <button type="submit" className="ac-save-btn" disabled={saving}>
                    {saving ? t('account.saving') : t('account.save_profile')}
                  </button>
                </div>
              </form>
            </section>

            {/* Danger zone */}
            <section className="ac-section ac-section--danger">
              <div className="ac-section-head">
                <span className="ac-section-label ac-section-label--danger">{t('account.danger_zone')}</span>
                <div className="ac-section-rule ac-section-rule--danger" />
              </div>
              <p className="ac-danger-desc">{t('account.danger_description')}</p>
              <button onClick={handleDelete} className="ac-delete-btn">
                {t('account.delete_account')}
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Account;
