import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import { useTranslation } from 'react-i18next';
import {
  User, BookOpen, MagnifyingGlass, ArrowCircleUp, SignOut, X, List
} from 'phosphor-react';
import LanguageSwitcher from '@/components/Layout/LanguageSwitcher'; // 👈 Import switcher
import ThemeSwitcher from '@/components/Layout/ThemeSwitcher'; // adjust path if needed

import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
    localStorage.setItem('logout-event', Date.now().toString());
  };

  const navItems = [
    { label: t('sidebar.infos'), path: '/infos', icon: <User size={20} /> },
    { label: t('sidebar.history'), path: '/history', icon: <BookOpen size={20} /> },
    { label: t('sidebar.analyze'), path: '/analyze', icon: <MagnifyingGlass size={20} /> },
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
              className={location.pathname === path ? 'active' : ''}
            >
              <span className="icon">{icon}</span>
              {label}
            </button>
          ))}
        </nav>

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
