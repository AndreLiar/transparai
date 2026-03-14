// src/components/common/AIConsentModal.tsx
// Explicit GDPR Art. 22 consent for AI document processing
// Must be shown and accepted before any analysis can run
import React, { useState } from 'react';
import './AIConsentModal.css';

interface AIConsentModalProps {
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

const AIConsentModal: React.FC<AIConsentModalProps> = ({ onAccept, onDecline, loading }) => {
  const [checked, setChecked] = useState(false);

  return (
    <div className="ai-consent-overlay" role="dialog" aria-modal="true" aria-labelledby="ai-consent-title">
      <div className="ai-consent-modal">
        <h2 id="ai-consent-title">Consentement au traitement IA</h2>

        <div className="ai-consent-body">
          <p>
            Pour analyser votre document, TransparAI utilise des modèles d'intelligence artificielle de tiers :
          </p>
          <ul>
            <li><strong>Azure OpenAI / GPT-4o mini</strong> (Microsoft, région UE) — modèle principal</li>
            <li><strong>Azure OpenAI / GPT-4o</strong> (Microsoft, région UE) — plans Premium et Enterprise</li>
          </ul>
          <p>
            Le texte de votre document sera transmis à ces services pour traitement automatisé.
            Microsoft Azure est soumis à un contrat de traitement des données (DPA) conforme au RGPD, avec données hébergées en Union Européenne.
          </p>
          <p>
            <strong>Ce que cela implique :</strong>
          </p>
          <ul>
            <li>Votre document quitte temporairement les serveurs TransparAI pour être analysé</li>
            <li>L'analyse est automatisée — aucun humain ne lit votre document</li>
            <li>Les résultats sont <strong>informatifs uniquement</strong>, pas des avis juridiques</li>
            <li>Vous pouvez retirer ce consentement à tout moment dans vos paramètres de confidentialité</li>
          </ul>

          <label className="ai-consent-checkbox">
            <input
              type="checkbox"
              checked={checked}
              onChange={e => setChecked(e.target.checked)}
            />
            J'ai lu et j'accepte le traitement de mes documents par les modèles IA tiers listés ci-dessus, conformément au RGPD.
          </label>
        </div>

        <div className="ai-consent-actions">
          <button
            className="ai-consent-btn ai-consent-btn--accept"
            onClick={onAccept}
            disabled={!checked || loading}
          >
            {loading ? 'Enregistrement...' : 'Accepter et continuer'}
          </button>
          <button
            className="ai-consent-btn ai-consent-btn--decline"
            onClick={onDecline}
            disabled={loading}
          >
            Refuser
          </button>
        </div>

        <p className="ai-consent-footer">
          Conformément au RGPD Art. 22 et à la réglementation européenne sur l'IA (EU AI Act).
        </p>
      </div>
    </div>
  );
};

export default AIConsentModal;
