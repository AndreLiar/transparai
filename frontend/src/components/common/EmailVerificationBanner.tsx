import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { sendEmailVerification } from 'firebase/auth';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || user.emailVerified || dismissed) return null;

  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      await sendEmailVerification(user);
      alert('Email de vérification renvoyé !');
    } catch (error) {
      console.error('Error resending verification:', error);
      alert('Erreur lors de l\'envoi de l\'email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: '#0A1E3F',
      padding: '12px 16px',
      fontSize: '14px',
      fontWeight: '500',
      textAlign: 'center',
      position: 'relative',
      borderBottom: '1px solid rgba(0,0,0,0.1)'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
        <span>
          📧 Vérifiez votre email pour sécuriser votre compte et éviter de perdre vos analyses
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleResendVerification}
            disabled={isResending}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              color: '#0A1E3F',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            {isResending ? 'Envoi...' : 'Renvoyer'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px 8px',
              borderRadius: '6px',
              color: '#0A1E3F',
              fontSize: '16px',
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            title="Masquer"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;