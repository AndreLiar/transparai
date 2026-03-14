// src/components/common/AIDisclaimer.tsx
// Mandatory EU AI Act Art. 13 transparency disclosure shown on every AI result
import React, { useState } from 'react';
import './AIDisclaimer.css';

interface AIDisclaimerProps {
  modelUsed?: string;
  confidenceLevel?: 'high' | 'medium' | 'low';
  requiresHumanReview?: boolean;
  promptVersion?: string;
  jurisdiction?: string;
}

const CONFIDENCE_LABEL: Record<string, string> = {
  high: 'Élevée',
  medium: 'Moyenne',
  low: 'Faible — vérification recommandée',
};

const CONFIDENCE_COLOR: Record<string, string> = {
  high: '#22c55e',
  medium: '#f59e0b',
  low: '#ef4444',
};

const AIDisclaimer: React.FC<AIDisclaimerProps> = ({
  modelUsed,
  confidenceLevel = 'medium',
  requiresHumanReview = false,
  promptVersion,
  jurisdiction = 'FR',
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="ai-disclaimer">
      {requiresHumanReview && (
        <div className="ai-disclaimer__review-alert">
          <strong>Vérification humaine recommandée</strong> — La confiance de l'IA sur ce document est faible. Consultez un professionnel du droit avant toute décision.
        </div>
      )}

      <div className="ai-disclaimer__main">
        <span className="ai-disclaimer__icon">⚠️</span>
        <div className="ai-disclaimer__text">
          <strong>Avertissement légal :</strong> Cette analyse est générée par une intelligence artificielle à titre <strong>informatif uniquement</strong>. Elle ne constitue pas un avis juridique professionnel et ne remplace pas la consultation d'un avocat.
          {' '}
          <button
            className="ai-disclaimer__toggle"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            {expanded ? 'Moins d\'infos' : 'En savoir plus'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="ai-disclaimer__details">
          <p>
            TransparAI n'est pas un cabinet d'avocats. Les résultats peuvent contenir des inexactitudes.
            Vérifiez toujours les clauses importantes avec un professionnel du droit qualifié avant de signer tout contrat.
          </p>
          <p>
            Vos documents sont traités par des modèles d'IA tiers (Google Gemini et/ou OpenAI) dans le cadre de votre consentement RGPD.
            Droit applicable : {jurisdiction === 'FR' ? 'France / Union Européenne' : jurisdiction}.
          </p>
          <div className="ai-disclaimer__meta">
            {modelUsed && (
              <span className="ai-disclaimer__meta-item">
                Modèle IA : <code>{modelUsed}</code>
              </span>
            )}
            <span
              className="ai-disclaimer__meta-item"
              style={{ color: CONFIDENCE_COLOR[confidenceLevel] }}
            >
              Confiance : {CONFIDENCE_LABEL[confidenceLevel] || confidenceLevel}
            </span>
            {promptVersion && (
              <span className="ai-disclaimer__meta-item">
                Version d'analyse : <code>{promptVersion}</code>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIDisclaimer;
