//src/screens/AuthenticationsPages/Login.tsx
// src/screens/AuthenticationsPages/Login.tsx
import React from 'react';
import LoginHeader from '@/components/AuthComponents/Login/LoginHeader';
import LoginForm from '@/components/AuthComponents/Login/LoginForm';
import './auth.css';

const Login: React.FC = () => {
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
