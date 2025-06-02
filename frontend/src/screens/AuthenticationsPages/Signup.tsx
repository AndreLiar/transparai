// src/screens/AuthenticationsPages/Signup.tsx
import React, { useState } from 'react';
import { auth } from '@/configFirebase/Firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

import SignupForm from '@/components/AuthComponents/Signup/SignupForm';
import VerificationModal from '@/components/AuthComponents/Signup/VerificationModal';
import { validatePassword } from '@/utils/validatePassword';
import { validateEmail } from '@/utils/validateEmail';
import './auth.css';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setError(emailError || passwordError);
      setLoading(false);
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/verify-email');
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-logo-section">
          <img src={logo} alt="TransparAI Logo" />
          <h2>Créer un compte</h2>
          <p>L’IA qui éclaire vos conditions d’abonnement.</p>
        </div>

        <SignupForm
          email={email}
          password={password}
          onChangeEmail={(e) => setEmail(e.target.value)}
          onChangePassword={(e) => setPassword(e.target.value)}
          onSubmit={handleSignup}
          loading={loading}
          error={error}
        />
      </div>

      <VerificationModal show={showModal} email={email} onClose={handleModalClose} />
    </div>
  );
};

export default Signup;
