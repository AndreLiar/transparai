import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';
import { submitContactForm, ContactFormData } from '../../services/contactService';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Submit form using real email service
      const result = await submitContactForm(formData as ContactFormData);
      
      if (result.success) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setSubmitStatus('error');
        console.error('Contact form error:', result.message);
      }
    } catch (error) {
      console.error('Contact form submission failed:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="legal-container">
      <header className="legal-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>Contact</h1>
          <p className="subtitle">Une question ? Un problème ? Nous sommes là pour vous aider.</p>
        </div>
      </header>

      <main className="legal-content">
        <div className="container">
          <div className="contact-grid">
            {/* Informations de contact */}
            <section className="contact-info">
              <h2>Nous contacter</h2>
              
              <div className="contact-method">
                <h3>📧 Support technique</h3>
                <p>
                  <strong>Email :</strong> ktaylconsult@gmail.com<br />
                  <strong>Temps de réponse :</strong> 24-48h en moyenne
                </p>
              </div>

              <div className="contact-method">
                <h3>💼 Questions commerciales</h3>
                <p>
                  <strong>Email :</strong> ktaylconsult@gmail.com<br />
                  <strong>Temps de réponse :</strong> 12-24h en moyenne
                </p>
              </div>

              <div className="contact-method">
                <h3>⚖️ Questions juridiques</h3>
                <p>
                  <strong>Email :</strong> ktaylconsult@gmail.com<br />
                  <strong>Temps de réponse :</strong> 3-5 jours ouvrés
                </p>
              </div>

              <div className="contact-method">
                <h3>🔒 Protection des données</h3>
                <p>
                  <strong>Email :</strong> ktaylconsult@gmail.com<br />
                  <strong>Temps de réponse :</strong> 2-3 jours ouvrés
                </p>
              </div>

            </section>

            {/* Formulaire de contact */}
            <section className="contact-form-section">
              <h2>Envoyez-nous un message</h2>
              
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nom complet *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="votre.email@exemple.com"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Sujet *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="support">Support technique</option>
                    <option value="billing">Questions de facturation</option>
                    <option value="feature">Demande de fonctionnalité</option>
                    <option value="partnership">Partenariat</option>
                    <option value="data">Protection des données</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    placeholder="Décrivez votre demande ou votre problème..."
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className={`submit-btn ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Envoi en cours...' : 'Envoyer le message'}
                </button>

                {submitStatus === 'success' && (
                  <div className="form-message success">
                    ✅ <strong>Message envoyé avec succès !</strong><br/>
                    Nous avons bien reçu votre demande et vous répondrons dans les 24-48 heures. 
                    Vous devriez également recevoir un email de confirmation.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="form-message error">
                    ❌ <strong>Erreur lors de l'envoi</strong><br/>
                    Une erreur s'est produite. Veuillez réessayer ou nous contacter directement à 
                    <a href="mailto:ktaylconsult@gmail.com" style={{color: '#ef4444', textDecoration: 'underline', marginLeft: '4px'}}>
                      ktaylconsult@gmail.com
                    </a>
                  </div>
                )}
              </form>
            </section>
          </div>

          {/* FAQ rapide */}
          <section className="quick-faq">
            <h2>Questions fréquentes</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>🚀 Comment commencer ?</h3>
                <p>Créez un compte gratuit et commencez immédiatement avec 20 analyses par mois.</p>
              </div>
              
              <div className="faq-item">
                <h3>💳 Comment changer d'abonnement ?</h3>
                <p>Rendez-vous dans votre espace compte pour upgrade ou downgrade à tout moment.</p>
              </div>
              
              <div className="faq-item">
                <h3>🔒 Mes données sont-elles sécurisées ?</h3>
                <p>Oui, nous utilisons un chiffrement de niveau bancaire et supprimons automatiquement vos documents après analyse.</p>
              </div>
              
              <div className="faq-item">
                <h3>⚡ Quelle est la précision de l'IA ?</h3>
                <p>Notre IA a une précision de ~95% sur l'identification des clauses importantes, mais nous recommandons toujours une validation humaine pour les décisions critiques.</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Contact;