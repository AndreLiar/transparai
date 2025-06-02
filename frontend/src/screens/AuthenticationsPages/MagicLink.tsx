//src/screens/AuthenticationsPages/MagicLink.tsx
// src/screens/AuthenticationsPages/MagicLink.tsx
import React, { useEffect, useState } from 'react';
import {
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  setPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from '@/configFirebase/Firebase';
import { useNavigate } from 'react-router-dom';

import MagicLinkHeader from '@/components/AuthComponents/MagicLink/MagicLinkHeader';
import MagicLinkForm from '@/components/AuthComponents/MagicLink/MagicLinkForm';
import MagicLinkMessage from '@/components/AuthComponents/MagicLink/MagicLinkMessage';
import './auth.css';

const MagicLink: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const completeMagicLogin = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        const storedEmail = window.localStorage.getItem('emailForSignIn');
        const emailToUse = storedEmail || window.prompt('Entrez votre email pour confirmer');

        if (!emailToUse) {
          setError("Email requis pour terminer la connexion.");
          return;
        }

        try {
          await setPersistence(auth, browserSessionPersistence);
          await signInWithEmailLink(auth, emailToUse, window.location.href);
          window.localStorage.removeItem('emailForSignIn');
          navigate('/dashboard');
        } catch {
          setError("Lien invalide ou expiré.");
        }
      }
    };

    completeMagicLogin();
  }, [navigate]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/magic-link`,
        handleCodeInApp: true
      });
      window.localStorage.setItem('emailForSignIn', email);
      setMessage("📩 Lien envoyé ! Vérifiez votre boîte de réception.");
    } catch {
      setError("Erreur lors de l'envoi du lien.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <MagicLinkHeader />
        <MagicLinkMessage message={message} error={error} />
        <MagicLinkForm
          email={email}
          onChange={(e) => setEmail(e.target.value)}
          onSubmit={handleSendLink}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default MagicLink;
