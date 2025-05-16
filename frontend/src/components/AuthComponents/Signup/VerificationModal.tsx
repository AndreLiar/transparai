//src/components/AuthComponents/VerificationModal.tsx
import React from 'react';

interface VerificationModalProps {
  show: boolean;
  email: string;
  onClose: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ show, email, onClose }) => {
  if (!show) return null;

  return (
    <>
      <div className="modal fade show" style={{ display: 'block' }}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content shadow">
            <div className="modal-header">
              <h5 className="modal-title">📧 Vérification envoyée</h5>
            </div>
            <div className="modal-body">
              <p>Un email de vérification a été envoyé à <strong>{email}</strong>.</p>
              <p>Merci de confirmer votre adresse avant de continuer.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={onClose}>
                Continuer
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
};

export default VerificationModal;
