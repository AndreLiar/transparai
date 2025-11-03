// src/screens/AuthenticationsPages/Signup.tsx
import React, { useState, useEffect } from 'react';
import { auth } from '@/configFirebase/Firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [loadingInvitation, setLoadingInvitation] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check for invitation token
  const invitationToken = searchParams.get('invitation');

  // Load invitation details if token exists
  useEffect(() => {
    if (invitationToken) {
      loadInvitationDetails();
    }
  }, [invitationToken]);

  const loadInvitationDetails = async () => {
    setLoadingInvitation(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/organization/invitation/${invitationToken}`);
      if (response.ok) {
        const details = await response.json();
        setInvitationDetails(details);
        setEmail(details.email); // Pre-fill email
      } else {
        setError('Invitation invalide ou expirée.');
      }
    } catch (err) {
      setError('Erreur lors du chargement de l\'invitation.');
    } finally {
      setLoadingInvitation(false);
    }
  };

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
    // If there's an invitation token, redirect to accept invitation after email verification
    if (invitationToken) {
      navigate(`/verify-email?invitation=${invitationToken}`);
    } else {
      navigate('/verify-email');
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {loadingInvitation && (
          <div className="invitation-notice">
            <div className="invitation-notice-content">
              <h3>🔄 Chargement de l'invitation...</h3>
              <p>Vérification des détails de l'invitation...</p>
            </div>
          </div>
        )}

        {invitationDetails && (
          <div className="invitation-notice">
            <div className="invitation-notice-content">
              <h3>🏢 Invitation à rejoindre "{invitationDetails.organizationName}"</h3>
              <p><strong>{invitationDetails.inviterName}</strong> vous invite en tant que <strong>{invitationDetails.role}</strong></p>
              {invitationDetails.customMessage && (
                <p style={{fontStyle: 'italic', marginTop: '0.5rem'}}>"{invitationDetails.customMessage}"</p>
              )}
              <p style={{fontSize: '0.9rem', color: '#6b7280', marginTop: '1rem'}}>
                Créez votre compte pour rejoindre l'organisation et accéder aux fonctionnalités Enterprise.
              </p>
            </div>
          </div>
        )}
        
        <div className="auth-logo-section">
          <img src={logo} alt="TransparAI Logo" />
          <h2>{invitationDetails ? 'Créer votre compte' : 'Créer un compte'}</h2>
          <p>L'IA qui éclaire vos conditions d'abonnement.</p>
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
