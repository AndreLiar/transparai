// src/components/LandingComponents/Features.tsx
import React from 'react';
// import './Features.css'; // Temporarily disabled to avoid conflicts

// Features data is now hardcoded in the component for better reliability

const Features: React.FC = () => {
  return (
    <section className="features-section" style={{ padding: '80px 24px', background: '#F6F8FC' }}>
      <div className="features-container" style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div className="features-header" style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 className="features-title" style={{ 
            fontSize: '3rem', 
            fontWeight: '800', 
            color: '#0A1E3F', 
            marginBottom: '24px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Fonctionnalités Qui Font la Différence
          </h2>
          <p className="features-subtitle" style={{ 
            fontSize: '1.25rem', 
            color: '#64748b', 
            lineHeight: '1.6',
            fontFamily: 'Inter, sans-serif'
          }}>
            Une suite complète d'outils IA conçue pour révolutionner votre façon 
            d'analyser les documents contractuels.
          </p>
        </div>
        <div className="features-grid" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '32px' 
        }}>
          
          {/* Feature 1 - AI Analysis */}
          <div 
            style={{
              background: 'white !important',
              borderRadius: '24px',
              padding: '32px',
              border: '2px solid #005CFF',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1,
              overflow: 'visible'
            }}
          >
            <div 
                            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #005CFF 0%, #5f6df5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <span style={{ fontSize: '36px', lineHeight: '1', color: 'white' }}>🧠</span>
            </div>
            <h5 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0A1E3F !important', 
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.25',
              zIndex: 10,
              position: 'relative',
              textShadow: 'none',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}>
              Analyse IA Ultra-Précise
            </h5>
            <p style={{ 
              fontSize: '1rem', 
              color: '#64748b !important', 
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              flexGrow: 1,
              zIndex: 10,
              position: 'relative',
              textShadow: 'none',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}>
              Intelligence artificielle Gemini 2.0 Flash pour une analyse exhaustive et des résumés clairs en quelques secondes.
            </p>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#0A1E3F',
              fontSize: '10px',
              fontWeight: '700',
              padding: '8px 12px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              fontFamily: 'Inter, sans-serif'
            }}>
              Fonctionnalité Phare
            </div>
          </div>

          {/* Feature 2 - Visual Scoring */}
          <div 
            style={{
              background: 'white !important',
              borderRadius: '24px',
              padding: '32px',
              border: '2px solid #005CFF',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1,
              overflow: 'visible'
            }}
          >
            <div 
                            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #005CFF 0%, #5f6df5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <span style={{ fontSize: '36px', lineHeight: '1', color: 'white' }}>📊</span>
            </div>
            <h5 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0A1E3F !important', 
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.25',
              zIndex: 10,
              position: 'relative',
              textShadow: 'none',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}>
              Score de Transparence Visuel
            </h5>
            <p style={{ 
              fontSize: '1rem', 
              color: '#64748b !important', 
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              flexGrow: 1,
              zIndex: 10,
              position: 'relative',
              textShadow: 'none',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}>
              Notation claire de 0 à 100 avec visualisation colorée pour évaluer instantanément la qualité de vos contrats.
            </p>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#0A1E3F',
              fontSize: '10px',
              fontWeight: '700',
              padding: '8px 12px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              fontFamily: 'Inter, sans-serif'
            }}>
              Fonctionnalité Phare
            </div>
          </div>

          {/* Feature 3 - Clause Detection */}
          <div 
            style={{
              background: 'white !important',
              borderRadius: '24px',
              padding: '32px',
              border: '2px solid #005CFF',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 1,
              overflow: 'visible'
            }}
          >
            <div 
                            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #005CFF 0%, #5f6df5 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <span style={{ fontSize: '36px', lineHeight: '1', color: 'white' }}>🛡️</span>
            </div>
            <h5 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0A1E3F !important', 
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.25',
              zIndex: 10,
              position: 'relative',
              textShadow: 'none',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}>
              Détection de Clauses Abusives
            </h5>
            <p style={{ 
              fontSize: '1rem', 
              color: '#64748b !important', 
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              flexGrow: 1,
              zIndex: 10,
              position: 'relative',
              textShadow: 'none',
              display: 'block',
              visibility: 'visible',
              opacity: 1
            }}>
              Identification automatique des pièges contractuels et alertes visuelles pour vous protéger efficacement.
            </p>
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              color: '#0A1E3F',
              fontSize: '10px',
              fontWeight: '700',
              padding: '8px 12px',
              borderRadius: '999px',
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
              fontFamily: 'Inter, sans-serif'
            }}>
              Fonctionnalité Phare
            </div>
          </div>

          {/* Feature 4 - History */}
          <div 
            className="feature-card" 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div 
                            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 92, 255, 0.1) 0%, rgba(0, 92, 255, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <span style={{ fontSize: '36px', lineHeight: '1' }}>📋</span>
            </div>
            <h5 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0A1E3F', 
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.25'
            }}>
              Historique Complet & Sécurisé
            </h5>
            <p style={{ 
              fontSize: '1rem', 
              color: '#64748b', 
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              flexGrow: 1
            }}>
              Toutes vos analyses sauvegardées, organisées et accessibles à tout moment avec recherche avancée.
            </p>
          </div>

          {/* Feature 5 - PDF Export */}
          <div 
            className="feature-card" 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div 
                            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 92, 255, 0.1) 0%, rgba(0, 92, 255, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <span style={{ fontSize: '36px', lineHeight: '1' }}>⬇️</span>
            </div>
            <h5 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0A1E3F', 
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.25'
            }}>
              Export PDF Professionnel
            </h5>
            <p style={{ 
              fontSize: '1rem', 
              color: '#64748b', 
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              flexGrow: 1
            }}>
              Rapports élégants téléchargeables avec votre branding pour présenter vos analyses.
            </p>
          </div>

          {/* Feature 6 - Security */}
          <div 
            className="feature-card" 
            style={{
              background: 'white',
              borderRadius: '24px',
              padding: '32px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
              position: 'relative',
              minHeight: '320px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <div 
                            style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(0, 92, 255, 0.1) 0%, rgba(0, 92, 255, 0.15) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}
            >
              <span style={{ fontSize: '36px', lineHeight: '1' }}>🔒</span>
            </div>
            <h5 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '700', 
              color: '#0A1E3F', 
              marginBottom: '16px',
              fontFamily: 'Inter, sans-serif',
              lineHeight: '1.25'
            }}>
              Sécurité & Conformité RGPD
            </h5>
            <p style={{ 
              fontSize: '1rem', 
              color: '#64748b', 
              lineHeight: '1.6',
              fontFamily: 'Inter, sans-serif',
              flexGrow: 1
            }}>
              Protection maximale de vos données avec chiffrement et respect strict de la réglementation européenne.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;