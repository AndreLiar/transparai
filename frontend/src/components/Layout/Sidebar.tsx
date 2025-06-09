// src/components/Layout/Sidebar.tsx
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import {
  User, BookOpen, MagnifyingGlass, ArrowCircleUp, SignOut, X, List
} from 'phosphor-react';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
    localStorage.setItem('logout-event', Date.now().toString());
  };

  const navItems = [
    { label: 'Infos', path: '/infos', icon: <User size={20} /> },
    { label: 'Historique', path: '/history', icon: <BookOpen size={20} /> },
    { label: 'Analyse', path: '/analyze', icon: <MagnifyingGlass size={20} /> },
    { label: 'Upgrade', path: '/upgrade', icon: <ArrowCircleUp size={20} /> },
  ];

  return (
    <>
      <button className="hamburger-toggle" onClick={() => setIsOpen(true)} aria-label="Ouvrir menu">
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
            aria-label="Accueil"
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
          <button className="logout-btn" onClick={handleLogout}>
            <SignOut size={20} className="icon" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
