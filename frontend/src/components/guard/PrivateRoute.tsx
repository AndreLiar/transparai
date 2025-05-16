//src/components/guard/PrivateRoute.tsx
// src/components/guard/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireEmailVerified?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requireEmailVerified = false }) => {
  const { user, loading } = useAuth();

  if (loading) return <p className="text-center py-5">Chargement...</p>;

  if (!user) return <Navigate to="/login" />;

  if (requireEmailVerified && !user.emailVerified) {
    return <Navigate to="/verify-email" />;
  }

  return children;
};

export default PrivateRoute;
