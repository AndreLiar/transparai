import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UpgradePrompt.css';

interface UpgradePromptProps {
  context: 'quota_reached' | 'feature_locked' | 'enhanced_features' | 'history_access';
  className?: string;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ context, className = '' }) => {
  const navigate = useNavigate();

  const getPromptContent = () => {
    switch (context) {
      case 'quota_reached':
        return {
          icon: '📊',
          title: 'Quota mensuel atteint',
          subtitle: 'Passez à un plan payant pour continuer vos analyses',
          cta: 'Voir les plans',
          variant: 'warning'
        };
      case 'feature_locked':
        return {
          icon: '🔒',
          title: 'Fonctionnalité Premium',
          subtitle: 'Cette fonctionnalité est réservée aux abonnés Premium',
          cta: 'Débloquer Premium',
          variant: 'premium'
        };
      case 'enhanced_features':
        return {
          icon: '✨',
          title: 'Débloquez plus de fonctionnalités',
          subtitle: 'Historique, export PDF, analyses illimitées et plus',
          cta: 'Découvrir Premium',
          variant: 'discover'
        };
      case 'history_access':
        return {
          icon: '📋',
          title: 'Historique complet',
          subtitle: 'Accédez à toutes vos analyses passées avec un plan payant',
          cta: 'Activer l\'historique',
          variant: 'feature'
        };
      default:
        return {
          icon: '🚀',
          title: 'Passez au niveau supérieur',
          subtitle: 'Débloquez toutes les fonctionnalités de TransparAI',
          cta: 'Voir les plans',
          variant: 'default'
        };
    }
  };

  const content = getPromptContent();

  return (
    <div className={`upgrade-prompt upgrade-prompt--${content.variant} ${className}`}>
      <div className="upgrade-prompt__content">
        <div className="upgrade-prompt__icon">{content.icon}</div>
        <div className="upgrade-prompt__text">
          <h3 className="upgrade-prompt__title">{content.title}</h3>
          <p className="upgrade-prompt__subtitle">{content.subtitle}</p>
        </div>
      </div>
      <button 
        className="upgrade-prompt__cta"
        onClick={() => navigate('/upgrade')}
      >
        {content.cta} →
      </button>
    </div>
  );
};

export default UpgradePrompt;