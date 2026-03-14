// src/screens/Onboarding/Onboarding.tsx
// 3-step first-time onboarding shown once after email verification
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import './Onboarding.css';

const STEPS = [
  {
    icon: '📄',
    title: 'Importez votre contrat',
    description:
      'Collez le texte, uploadez un PDF ou prenez une photo de votre document. Notre OCR extrait automatiquement le texte pour vous.',
    tip: 'Fonctionne avec les CGU, CGV, baux, contrats de travail, contrats de prestation...',
  },
  {
    icon: '🤖',
    title: "L'IA analyse en 30 secondes",
    description:
      'Azure OpenAI GPT-4o parcourt chaque clause, détecte les risques et produit un score de transparence de A+ à F.',
    tip: 'Vos documents ne quittent jamais l\'Union Européenne et ne sont jamais utilisés pour entraîner des modèles IA.',
  },
  {
    icon: '📊',
    title: 'Lisez, comprenez, décidez',
    description:
      'Recevez un résumé clair sans jargon juridique, une liste des clauses à surveiller et un rapport exportable en PDF.',
    tip: 'Les résultats sont informatifs. En cas de doute sur un contrat important, consultez un avocat.',
  },
];

const ONBOARDING_KEY = 'transparai_onboarding_done';

const Onboarding: React.FC = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth();

  const finish = () => {
    if (user) {
      localStorage.setItem(`${ONBOARDING_KEY}_${user.uid}`, '1');
    }
    navigate('/analyze');
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-card">
        <div className="onboarding-progress">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`onboarding-dot ${i <= step ? 'active' : ''}`}
            />
          ))}
        </div>

        <div className="onboarding-icon">{current.icon}</div>
        <h2 className="onboarding-title">{current.title}</h2>
        <p className="onboarding-description">{current.description}</p>
        <p className="onboarding-tip">💡 {current.tip}</p>

        <div className="onboarding-actions">
          {step > 0 && (
            <button
              className="onboarding-btn onboarding-btn--back"
              onClick={() => setStep(s => s - 1)}
            >
              Retour
            </button>
          )}
          <button
            className="onboarding-btn onboarding-btn--next"
            onClick={() => (isLast ? finish() : setStep(s => s + 1))}
          >
            {isLast ? '🚀 Analyser mon premier contrat' : 'Suivant →'}
          </button>
        </div>

        <button className="onboarding-skip" onClick={finish}>
          Passer l'introduction
        </button>
      </div>
    </div>
  );
};

export { ONBOARDING_KEY };
export default Onboarding;
