import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { fetchDashboardData } from '@/services/InfoService';
import {
  User, MagnifyingGlass, ArrowCircleUp, SignOut, X, List, Robot, Lock
} from 'phosphor-react';
import LanguageSwitcher from '@/components/Layout/LanguageSwitcher'; // 👈 Import switcher
import ThemeSwitcher from '@/components/Layout/ThemeSwitcher'; // adjust path if needed
import UpgradePrompt from '@/components/common/UpgradePrompt';

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
      } catch (error) {
        console.error('Error loading user plan:', error);
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
    { label: t('sidebar.analyze'), path: '/analyze', icon: <MagnifyingGlass size={20} /> },
    { label: t('sidebar.account'), path: '/account', icon: <User size={20} /> },
    { label: 'Paramètres IA', path: '/ai-settings', icon: <Robot size={20} /> },
    { label: 'Confidentialité', path: '/privacy-settings', icon: <Lock size={20} /> },
    { label: t('sidebar.upgrade'), path: '/upgrade', icon: <ArrowCircleUp size={20} /> },
  ];

  return (
    <>
      <button className="hamburger-toggle" onClick={() => setIsOpen(true)} aria-label={t('sidebar.open_menu')}>
        <List size={24} />
      </button>

      <div
        className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`}
        onClick={() => setIsOpen(false)}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <button
            className="logo"
            onClick={() => {
              navigate('/dashboard');
              setIsOpen(false);
            }}
            aria-label={t('sidebar.home')}
          >
            🧠 TransparAI
          </button>
          <button className="close-btn mobile-only" onClick={() => setIsOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {navItems.map(({ label, path, icon }) => (
            <button
              key={path}
              onClick={() => {
                navigate(path);
                setIsOpen(false);
              }}
              className={
                location.pathname === path || 
                (path === '/account' && (location.pathname === '/infos' || location.pathname === '/profile'))
                  ? 'active' : ''
              }
            >
              <span className="icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

        {/* Upgrade Prompt for Free/Starter Users */}
        {(userPlan === 'free' || userPlan === 'starter') && (
          <div className="sidebar-upgrade">
            <UpgradePrompt 
              context="enhanced_features"
              className="upgrade-prompt--compact"
            />
          </div>
        )}

  <div className="sidebar-footer">
  <div className="sidebar-controls">
    <LanguageSwitcher />
    <ThemeSwitcher />
  </div>
  <button className="logout-btn" onClick={handleLogout}>
    <SignOut size={20} className="icon" />
    {t('sidebar.logout')}
  </button>
</div>

      </aside>
    </>
  );
};

export default Sidebar;
