// src/components/AuthComponents/Login/LoginErrorModal.tsx
import React from 'react';
import './LoginErrorModal.css';

interface LoginErrorModalProps {
  show: boolean;
  onClose: () => void;
  message: string;
}

const LoginErrorModal: React.FC<LoginErrorModalProps> = ({ show, onClose, message }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3 className="modal-title">Erreur de connexion</h3>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body">
          <p>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="modal-button" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default LoginErrorModal;
