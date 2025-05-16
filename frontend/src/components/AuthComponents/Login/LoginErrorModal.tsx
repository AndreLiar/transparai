// src/components/AuthComponents/LoginErrorModal.tsx
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface LoginErrorModalProps {
  show: boolean;
  onClose: () => void;
  message: string;
}

const LoginErrorModal: React.FC<LoginErrorModalProps> = ({ show, onClose, message }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Erreur de connexion</Modal.Title>
      </Modal.Header>
      <Modal.Body>{message}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginErrorModal;
