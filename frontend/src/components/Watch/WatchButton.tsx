// src/components/Watch/WatchButton.tsx
// Drop-in button to place on the analysis result screen.
// When clicked, starts watching the analyzed document.
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { startWatch } from '@/services/watchService';
import './WatchButton.css';

interface WatchButtonProps {
  analysisId: string;
  documentName: string;
  text: string;
}

const WatchButton: React.FC<WatchButtonProps> = ({ analysisId, documentName, text }) => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'idle' | 'loading' | 'watching' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleWatch = async () => {
    if (!user || status === 'watching' || status === 'loading') return;
    setStatus('loading');
    setMessage('');

    try {
      const token = await user.getIdToken();
      const { created } = await startWatch(token, {
        name: documentName,
        analysisId,
        text,
        checkFrequency: 'weekly',
      });

      setStatus('watching');
      setMessage(created ? 'Document surveillé !' : 'Vous surveillez déjà ce document.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Erreur lors de la mise en surveillance');
    }
  };

  if (status === 'watching') {
    return (
      <div className="watch-button-container">
        <button className="watch-btn watch-btn--active" disabled>
          ✅ En cours de surveillance
        </button>
        <p className="watch-message">{message}</p>
      </div>
    );
  }

  return (
    <div className="watch-button-container">
      <button
        className="watch-btn"
        onClick={handleWatch}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? '⏳ Activation...' : '👁️ Surveiller ce document'}
      </button>
      {status === 'error' && <p className="watch-message watch-message--error">{message}</p>}
      <p className="watch-hint">
        Recevez un email dès que ce document est modifié.
      </p>
    </div>
  );
};

export default WatchButton;
