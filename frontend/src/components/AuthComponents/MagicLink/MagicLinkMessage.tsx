// src/components/AuthComponents/MagicLink/MagicLinkMessage.tsx
import React from 'react';
import './magic-link.css';

interface Props {
  message?: string;
  error?: string;
}

const MagicLinkMessage: React.FC<Props> = ({ message, error }) => (
  <>
    {message && <div className="alert success">{message}</div>}
    {error && <div className="alert error">{error}</div>}
  </>
);

export default MagicLinkMessage;
