//src/screens/AuthenticationsPages/Login.tsx
import React from 'react';
import LoginHeader from '@/components/AuthComponents/Login/LoginHeader';
import LoginForm from '@/components/AuthComponents/Login/LoginForm';

const Login: React.FC = () => {
  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm border-0 rounded-4 p-4" style={{ maxWidth: 500, width: '100%' }}>
        <LoginHeader />
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;
