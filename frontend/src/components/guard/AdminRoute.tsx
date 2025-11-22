// frontend/src/components/guard/AdminRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) {
      setIsAdmin(false);
      return;
    }

    try {
      const token = await user.getIdToken(true);
      const decodedToken = await user.getIdTokenResult();
      
      // Check if user has admin custom claim
      setIsAdmin(decodedToken.claims.admin === true);
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
    }
  };

  if (loading || isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg max-w-md text-center">
          <span className="text-6xl mb-4 block">🚫</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Accès refusé
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            Seuls les administrateurs peuvent accéder au tableau de bord admin.
          </p>
          <a
            href="/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retour au tableau de bord
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminRoute;
