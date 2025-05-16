// src/components/AuthComponents/MagicLink/MagicLinkMessage.tsx
import React from 'react';

interface Props {
  message?: string;
  error?: string;
}

const MagicLinkMessage: React.FC<Props> = ({ message, error }) => (
  <>
    {message && <div className="alert alert-success text-center">{message}</div>}
    {error && <div className="alert alert-danger text-center">{error}</div>}
  </>
);

export default MagicLinkMessage;
