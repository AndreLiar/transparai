//src/screens/AuthenticationsPages/VerifyEmail.tsx
import React, { useState } from 'react';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

const VerifyEmail: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResend = async () => {
    setMessage('');
    setError('');
    if (!user) {
      setError("Aucun utilisateur connecté.");
      return;
    }

    try {
      await sendEmailVerification(user);
      setMessage("📩 Lien de vérification renvoyé !");
    } catch (err: any) {
      setError("❌ Erreur lors de l’envoi de l’email.");
    }
  };

  const handleCheckAndGo = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await user.reload(); // 🔄 Refresh user's email verification status
      if (user.emailVerified) {
        navigate('/dashboard');
      } else {
        setError("Votre email n’est pas encore vérifié.");
      }
    } catch {
      setError("Échec de la vérification.");
    }
    setLoading(false);
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm border-0 rounded-4 p-4 w-100" style={{ maxWidth: 600 }}>
        <div className="text-center mb-3">
          <img
            src={logo}
            alt="TransparAI Logo"
            style={{ height: '48px', maxWidth: '160px', objectFit: 'contain' }}
            className="mb-2"
          />
          <h2 className="text-primary fw-bold">Vérification email requise</h2>
          <p className="text-muted">
            Un email de vérification a été envoyé à <strong>{user?.email}</strong>.
            Merci de cliquer sur le lien dans votre boîte de réception.
          </p>
        </div>

        {message && <div className="alert alert-success text-center">{message}</div>}
        {error && <div className="alert alert-danger text-center">{error}</div>}

        <div className="text-center mt-4 d-flex justify-content-center gap-3 flex-wrap">
          <button
            onClick={handleResend}
            className="btn btn-outline-primary"
            disabled={loading}
          >
            Renvoyer le lien
          </button>
          <button
            onClick={handleCheckAndGo}
            className="btn btn-success"
            disabled={loading}
          >
            {loading ? 'Vérification...' : 'Accéder au tableau de bord'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
