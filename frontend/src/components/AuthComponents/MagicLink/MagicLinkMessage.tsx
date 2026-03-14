// src/components/AuthComponents/MagicLink/MagicLinkMessage.tsx
import React from 'react';

interface Props {
  message?: string;
  error?: string;
}

const MagicLinkMessage: React.FC<Props> = ({ message, error }) => (
  <>
    {message && <div className="auth-alert success">{message}</div>}
    {error && <div className="auth-alert error">{error}</div>}
  </>
);

export default MagicLinkMessage;
