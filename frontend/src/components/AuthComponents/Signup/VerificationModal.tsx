// src/components/AuthComponents/VerificationModal.tsx
// src/components/AuthComponents/Signup/VerificationModal.tsx
import React from 'react';

interface VerificationModalProps {
  show: boolean;
  email: string;
  onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ show, email, onClose }) => {
  return (
    <div className={`modal-overlay ${show ? 'visible' : 'hidden'}`}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">📧 Vérification envoyée</h5>
        </div>
        <div className="modal-body">
          <p>Un email de vérification a été envoyé à <strong>{email}</strong>.</p>
          <p>Merci de confirmer votre adresse avant de continuer.</p>
        </div>
        <div className="modal-footer">
          <button className="btn primary w-full" onClick={onClose}>Continuer</button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
