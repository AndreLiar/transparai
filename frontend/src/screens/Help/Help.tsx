import React from 'react';
import { Link } from 'react-router-dom';
import './Help.css';

const Help: React.FC = () => {
  return (
    <div className="help-container">
      <header className="help-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>Centre d'Aide</h1>
          <p className="subtitle">Documentation et support pour TransparAI</p>
        </div>
      </header>

      <main className="help-content">
        <div className="container">
          <div className="coming-soon-section">
            <div className="coming-soon-card">
              <div className="icon-wrapper">
                <span className="coming-soon-icon">🚧</span>
              </div>
              
              <h2>Bientôt Disponible</h2>
              
              <p className="coming-soon-description">
                Notre centre d'aide complet est en cours de développement. 
                Vous y trouverez bientôt des guides détaillés, des tutoriels vidéo, 
                et une FAQ complète pour tirer le meilleur parti de TransparAI.
              </p>

              <div className="features-preview">
                <h3>Ce qui vous attend :</h3>
                <ul>
                  <li>📚 Guides d'utilisation pas à pas</li>
                  <li>🎥 Tutoriels vidéo interactifs</li>
                  <li>❓ FAQ détaillée avec exemples</li>
                  <li>🔧 Documentation API pour développeurs</li>
                  <li>💡 Conseils et bonnes pratiques</li>
                  <li>📞 Support technique avancé</li>
                </ul>
              </div>

              <div className="cta-section">
                <h3>En attendant, nous sommes là pour vous !</h3>
                <div className="help-actions">
                  <Link to="/contact" className="btn btn-primary">
                    📧 Nous Contacter
                  </Link>
                  <Link to="/analyze" className="btn btn-outline">
                    🚀 Essayer TransparAI
                  </Link>
                </div>
              </div>

              <div className="quick-help">
                <h4>Aide Rapide</h4>
                <div className="quick-help-grid">
                  <div className="help-item">
                    <h5>🔍 Comment analyser un document ?</h5>
                    <p>Rendez-vous sur la page d'analyse et uploadez votre fichier PDF ou collez le texte.</p>
                  </div>
                  <div className="help-item">
                    <h5>💳 Comment changer d'abonnement ?</h5>
                    <p>Accédez à votre compte et cliquez sur "Gérer l'abonnement" pour modifier votre plan.</p>
                  </div>
                  <div className="help-item">
                    <h5>📊 Où voir mes analyses ?</h5>
                    <p>Votre historique d'analyses est disponible dans votre tableau de bord personnel.</p>
                  </div>
                  <div className="help-item">
                    <h5>🔒 Mes données sont-elles sécurisées ?</h5>
                    <p>Oui, nous utilisons un chiffrement de niveau bancaire et supprimons vos documents après analyse.</p>
                  </div>
                </div>
              </div>

              <div className="notification-signup">
                <h4>📬 Soyez notifié du lancement</h4>
                <p>Laissez-nous vos coordonnées pour être prévenu dès que le centre d'aide sera disponible.</p>
                <Link to="/contact" className="notification-btn">
                  M'inscrire aux notifications
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Help;