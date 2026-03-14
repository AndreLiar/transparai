import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData } from '@/services/InfoService';
import {
  MagnifyingGlass, ArrowCircleUp, SignOut, X, List, Robot, Lock, User
} from 'phosphor-react';
import LanguageSwitcher from '@/components/Layout/LanguageSwitcher';
import ThemeSwitcher from '@/components/Layout/ThemeSwitcher';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userPlan, setUserPlan] = useState('free');

  useEffect(() => {
    const loadUserPlan = async () => {
      if (!user) return;
      try {
        const token = await user.getIdToken(true);
        const data = await fetchDashboardData(token);
        setUserPlan(data.plan);
      } catch {
        // silent
      }
    };
    loadUserPlan();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
    localStorage.setItem('logout-event', Date.now().toString());
  };

  const navItems = [
    { label: t('sidebar.analyze'), path: '/analyze', icon: <MagnifyingGlass size={18} /> },
    { label: t('sidebar.account'), path: '/account', icon: <User size={18} /> },
    { label: 'Param. IA', path: '/ai-settings', icon: <Robot size={18} /> },
    { label: 'Confidentialité', path: '/privacy-settings', icon: <Lock size={18} /> },
    { label: t('sidebar.upgrade'), path: '/upgrade', icon: <ArrowCircleUp size={18} /> },
  ];

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === '/account' && ['/infos', '/profile'].includes(location.pathname));

  return (
    <>
      <button className="hamburger-toggle" onClick={() => setIsOpen(true)} aria-label="Menu">
        <List size={20} />
      </button>

      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <button
            className="logo"
            onClick={() => { navigate('/dashboard'); setIsOpen(false); }}
            aria-label="Accueil"
          >
            TransparAI
          </button>
          <button className="close-btn mobile-only" onClick={() => setIsOpen(false)}>
            <X size={18} />
          </button>
        </div>

        <hr className="sidebar-rule" />

        {/* Nav */}
        <p className="sidebar-section-label">Navigation</p>
        <nav className="sidebar-menu">
          {navItems.map(({ label, path, icon }) => (
            <button
              key={path}
              onClick={() => { navigate(path); setIsOpen(false); }}
              className={isActive(path) ? 'active' : ''}
            >
              <span className="icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Upgrade nudge for free users */}
        {(userPlan === 'free' || userPlan === 'starter') && (
          <div className="sidebar-upgrade">
            <p className="sidebar-upgrade-label">Plan Gratuit</p>
            <p className="sidebar-upgrade-text">
              Passez à Standard pour 100 analyses/mois et l'export PDF.
            </p>
            <Link to="/upgrade" className="sidebar-upgrade-btn" onClick={() => setIsOpen(false)}>
              Passer à Standard
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-controls">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <SignOut size={16} />
            {t('sidebar.logout')}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
