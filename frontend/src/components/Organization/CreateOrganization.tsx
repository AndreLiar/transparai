// src/components/Organization/CreateOrganization.tsx
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createOrganization } from '@/services/organizationService';
import './CreateOrganization.css';

interface CreateOrganizationProps {
  onSuccess: () => void;
  onCancel?: () => void;
}

const CreateOrganization: React.FC<CreateOrganizationProps> = ({ onSuccess, onCancel }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    companyName: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#6b7280'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const token = await user.getIdToken(true);
      
      await createOrganization(token, {
        name: formData.name,
        domain: formData.domain || undefined,
        branding: {
          companyName: formData.companyName,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        }
      });

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création de l\'organisation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="create-org-container">
      <div className="create-org-card">
        <div className="create-org-header">
          <h2>🏢 Créer une organisation</h2>
          <p>Configurez votre organisation pour commencer à collaborer avec votre équipe</p>
        </div>

        {error && (
          <div className="create-org-error">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="create-org-form">
          <div className="form-section">
            <h3>Informations générales</h3>
            
            <div className="form-group">
              <label htmlFor="name">Nom de l'organisation *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Ex: Mon Entreprise SARL"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="companyName">Nom commercial</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Ex: Mon Entreprise (optionnel)"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="domain">Domaine de messagerie</label>
              <input
                type="text"
                id="domain"
                name="domain"
                value={formData.domain}
                onChange={handleChange}
                placeholder="Ex: monentreprise.com (optionnel)"
                disabled={loading}
              />
              <small className="form-help">
                Les utilisateurs avec ce domaine pourront rejoindre automatiquement votre organisation
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Personnalisation</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="primaryColor">Couleur primaire</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="primaryColor"
                    name="primaryColor"
                    value={formData.primaryColor}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    disabled={loading}
                    className="color-text-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="secondaryColor">Couleur secondaire</label>
                <div className="color-input-group">
                  <input
                    type="color"
                    id="secondaryColor"
                    name="secondaryColor"
                    value={formData.secondaryColor}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    disabled={loading}
                    className="color-text-input"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-preview">
            <h4>Aperçu</h4>
            <div 
              className="brand-preview"
              style={{
                '--primary-color': formData.primaryColor,
                '--secondary-color': formData.secondaryColor
              } as React.CSSProperties}
            >
              <div className="preview-header">
                🧠 TransparAI
              </div>
              <div className="preview-org">
                {formData.companyName || formData.name || 'Votre Organisation'}
              </div>
            </div>
          </div>

          <div className="form-actions">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
                disabled={loading}
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Création en cours...
                </>
              ) : (
                '🚀 Créer l\'organisation'
              )}
            </button>
          </div>
        </form>

        <div className="create-org-info">
          <div className="info-section">
            <h4>✨ Fonctionnalités Enterprise</h4>
            <ul>
              <li>👥 Gestion multi-utilisateurs avec rôles</li>
              <li>📊 Analyse comparative multi-documents</li>
              <li>🎨 Personnalisation de la marque</li>
              <li>📋 Journal d'audit complet</li>
              <li>🚀 Support technique dédié</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrganization;