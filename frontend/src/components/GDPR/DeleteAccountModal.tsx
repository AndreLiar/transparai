// frontend/src/components/GDPR/DeleteAccountModal.tsx
import React, { useState } from 'react';
import { gdprService } from '@/services/gdprService';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '@/configFirebase/Firebase';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleDelete = async () => {
    if (confirmation !== 'DELETE_MY_ACCOUNT') {
      alert(t('gdpr.deleteConfirmationError', 'Veuillez taper exactement: DELETE_MY_ACCOUNT'));
      return;
    }

    if (!window.confirm(t('gdpr.deleteWarning', 'ATTENTION: Cette action est IRRÉVERSIBLE. Continuer?'))) {
      return;
    }

    if (!user) {
      alert(t('errors.notAuthenticated', 'Vous devez être connecté'));
      return;
    }

    try {
      setLoading(true);
      const token = await user.getIdToken();
      await gdprService.deleteAccount(token, confirmation);
      
      // Sign out from Firebase
      await auth.signOut();
      
      alert(t('gdpr.deleteSuccess', 'Votre compte a été supprimé. Vous allez être déconnecté.'));
      navigate('/');
    } catch (error) {
      console.error('Delete failed:', error);
      alert(t('gdpr.deleteError', 'Échec de la suppression du compte'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          ⚠️ {t('gdpr.deleteAccount', 'Supprimer mon compte')}
        </h2>
        
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-red-800 dark:text-red-200 font-semibold">
            {t('gdpr.deleteWarningText', 'Cette action est IRRÉVERSIBLE. Toutes vos données seront supprimées définitivement.')}
          </p>
        </div>

        <p className="mb-4 text-gray-700 dark:text-gray-300">
          {t('gdpr.deleteInstructions', 'Pour confirmer, tapez:')} <strong>DELETE_MY_ACCOUNT</strong>
        </p>

        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="DELETE_MY_ACCOUNT"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {t('common.cancel', 'Annuler')}
          </button>
          <button
            onClick={handleDelete}
            disabled={loading || confirmation !== 'DELETE_MY_ACCOUNT'}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading 
              ? t('gdpr.deleting', 'Suppression...') 
              : t('gdpr.deleteDefinitively', 'Supprimer définitivement')}
          </button>
        </div>
      </div>
    </div>
  );
};
