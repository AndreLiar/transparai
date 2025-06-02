// src/components/Layout/Sidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import './Sidebar.css';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
    localStorage.setItem('logout-event', Date.now().toString());
  };

  return (
    <>
      {/* Backdrop for mobile */}
      <div className={`sidebar-backdrop ${isOpen ? 'visible' : ''}`} onClick={() => setIsOpen(false)}></div>

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h4>🧠 Logo</h4>
          <button className="close-btn mobile-only" onClick={() => setIsOpen(false)}>✖</button>
        </div>

        <nav className="sidebar-menu">
          <button onClick={() => { navigate('/infos'); setIsOpen(false); }}>Infos</button>
          <button onClick={() => { navigate('/history'); setIsOpen(false); }}>Historique</button>
          <button onClick={() => { navigate('/analyze'); setIsOpen(false); }}>Analyze</button>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>Déconnexion</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
