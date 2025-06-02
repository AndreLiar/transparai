// src/components/Layout/Sidebar.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
    // Also notify other tabs
    localStorage.setItem('logout-event', Date.now().toString());
  };

  return (
    <div className="bg-light border-end p-3" style={{ width: '220px' }}>
      <div className="mb-4 text-center">
        <h4>🧠 Logo</h4>
      </div>
      <ul className="nav flex-column">
        <li className="nav-item mb-2">
          <button onClick={() => navigate('/infos')} className="btn btn-outline-primary w-100">Infos</button>
        </li>
        <li className="nav-item mb-2">
          <button className="btn btn-outline-primary w-100">Historique</button>
        </li>
        <li className="nav-item mb-2">
          <button onClick={() => navigate('/analyze')} className="btn btn-outline-primary w-100">Analyze</button>
        </li>
        <li className="nav-item mt-auto">
          <button onClick={handleLogout} className="btn btn-danger w-100">Déconnexion</button>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
