import React from 'react';
import { Link } from 'react-router-dom';
import './ApiDocs.css';

const ApiDocs: React.FC = () => {
  return (
    <div className="api-docs-container">
      <header className="api-docs-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>📚 Documentation API</h1>
          <p className="subtitle">Guide complet de l'API TransparAI pour les développeurs</p>
        </div>
      </header>

      <main className="api-docs-content">
        <div className="container">
          {/* Overview Section */}
          <section className="api-overview">
            <div className="overview-card">
              <h2>🚀 Aperçu de l'API</h2>
              <p className="lead">
                L'API TransparAI permet aux développeurs d'intégrer facilement l'analyse de 
                conditions générales dans leurs applications. Analysez des documents, obtenez 
                des scores de transparence et accédez à des résumés détaillés.
              </p>
              <div className="api-stats">
                <div className="stat">
                  <span className="stat-number">🔗</span>
                  <span className="stat-label">REST API</span>
                </div>
                <div className="stat">
                  <span className="stat-number">🔑</span>
                  <span className="stat-label">Authentification sécurisée</span>
                </div>
                <div className="stat">
                  <span className="stat-number">📊</span>
                  <span className="stat-label">Réponses JSON</span>
                </div>
                <div className="stat">
                  <span className="stat-number">⚡</span>
                  <span className="stat-label">Temps réel</span>
                </div>
              </div>
            </div>
          </section>

          {/* Getting Started */}
          <section className="getting-started">
            <h2>🏁 Démarrage Rapide</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Inscription</h3>
                <p>Créez un compte TransparAI pour obtenir vos clés d'API</p>
                <Link to="/signup" className="step-link">S'inscrire →</Link>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Authentification</h3>
                <p>Utilisez votre token Firebase pour authentifier vos requêtes</p>
                <code>Authorization: Bearer YOUR_TOKEN</code>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Premier Appel</h3>
                <p>Testez votre intégration avec un document simple</p>
                <code>POST /api/analyze</code>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h3>Documentation</h3>
                <p>Explorez la documentation Swagger complète</p>
                <a href="http://localhost:5001/docs" target="_blank" rel="noopener noreferrer" className="step-link">
                  Voir la doc →
                </a>
              </div>
            </div>
          </section>

          {/* Main Endpoints */}
          <section className="main-endpoints">
            <h2>🔧 Endpoints Principaux</h2>
            <div className="endpoints-grid">
              <div className="endpoint-card">
                <div className="method post">POST</div>
                <h3>/api/analyze</h3>
                <p>Analyse un document (texte, PDF, image) et retourne un score de transparence avec résumé détaillé</p>
                <div className="endpoint-features">
                  <span className="feature">📄 Texte brut</span>
                  <span className="feature">📋 PDF</span>
                  <span className="feature">🖼️ Images</span>
                  <span className="feature">🤖 IA avancée</span>
                </div>
              </div>
              
              <div className="endpoint-card">
                <div className="method get">GET</div>
                <h3>/api/dashboard</h3>
                <p>Récupère l'historique des analyses, statistiques utilisateur et informations du plan</p>
                <div className="endpoint-features">
                  <span className="feature">📊 Statistiques</span>
                  <span className="feature">📈 Historique</span>
                  <span className="feature">💰 Quotas</span>
                </div>
              </div>

              <div className="endpoint-card">
                <div className="method post">POST</div>
                <h3>/api/comparative</h3>
                <p>Compare plusieurs documents simultanément pour identifier les différences</p>
                <div className="endpoint-features">
                  <span className="feature">⚖️ Comparaison</span>
                  <span className="feature">📋 Multi-docs</span>
                  <span className="feature">🔍 Différences</span>
                </div>
              </div>

              <div className="endpoint-card">
                <div className="method get">GET</div>
                <h3>/api/export</h3>
                <p>Exporte les résultats d'analyse en différents formats (PDF, Word, JSON)</p>
                <div className="endpoint-features">
                  <span className="feature">📄 PDF</span>
                  <span className="feature">📝 Word</span>
                  <span className="feature">📊 JSON</span>
                </div>
              </div>

              <div className="endpoint-card">
                <div className="method post">POST</div>
                <h3>/api/contact</h3>
                <p>Envoie un message de contact via le système de messagerie intégré</p>
                <div className="endpoint-features">
                  <span className="feature">✉️ Email</span>
                  <span className="feature">🤖 Auto-reply</span>
                  <span className="feature">📋 Templates</span>
                </div>
              </div>

              <div className="endpoint-card">
                <div className="method get">GET</div>
                <h3>/api/user</h3>
                <p>Gestion du profil utilisateur, préférences et informations d'abonnement</p>
                <div className="endpoint-features">
                  <span className="feature">👤 Profil</span>
                  <span className="feature">⚙️ Paramètres</span>
                  <span className="feature">💳 Abonnement</span>
                </div>
              </div>
            </div>
          </section>

          {/* Authentication */}
          <section className="authentication">
            <h2>🔐 Authentification</h2>
            <div className="auth-content">
              <div className="auth-method">
                <h3>🔑 Firebase Authentication</h3>
                <p>Toutes les requêtes API nécessitent un token Firebase valide dans le header Authorization :</p>
                <div className="code-block">
                  <code>
                    {`{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}`}
                  </code>
                </div>
                <p>Obtenez votre token après connexion via Firebase Auth SDK.</p>
              </div>
            </div>
          </section>

          {/* Rate Limits */}
          <section className="rate-limits">
            <h2>⚡ Limites et Quotas</h2>
            <div className="limits-grid">
              <div className="limit-card">
                <h3>🌍 Limites Générales</h3>
                <ul>
                  <li><strong>100 requêtes/minute</strong> pour les endpoints généraux</li>
                  <li><strong>10 analyses/minute</strong> pour l'endpoint d'analyse</li>
                  <li><strong>10MB max</strong> par fichier uploadé</li>
                  <li><strong>Timeout 30s</strong> pour les requêtes longues</li>
                </ul>
              </div>
              <div className="limit-card">
                <h3>💰 Quotas par Plan</h3>
                <ul>
                  <li><strong>Gratuit :</strong> 20 analyses/mois</li>
                  <li><strong>Freelance :</strong> 500 analyses/mois</li>
                  <li><strong>Business :</strong> 2000 analyses/mois</li>
                  <li><strong>Enterprise :</strong> Analyses illimitées</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Error Codes */}
          <section className="error-codes">
            <h2>⚠️ Codes d'Erreur</h2>
            <div className="error-table">
              <div className="error-row header">
                <span>Code</span>
                <span>Signification</span>
                <span>Description</span>
              </div>
              <div className="error-row">
                <span className="code">200</span>
                <span>OK</span>
                <span>Requête réussie</span>
              </div>
              <div className="error-row">
                <span className="code">400</span>
                <span>Bad Request</span>
                <span>Paramètres invalides ou manquants</span>
              </div>
              <div className="error-row">
                <span className="code">401</span>
                <span>Unauthorized</span>
                <span>Token d'authentification manquant ou invalide</span>
              </div>
              <div className="error-row">
                <span className="code">403</span>
                <span>Forbidden</span>
                <span>Accès refusé ou quota dépassé</span>
              </div>
              <div className="error-row">
                <span className="code">429</span>
                <span>Too Many Requests</span>
                <span>Limite de taux dépassée</span>
              </div>
              <div className="error-row">
                <span className="code">500</span>
                <span>Internal Server Error</span>
                <span>Erreur interne du serveur</span>
              </div>
            </div>
          </section>

          {/* SDKs and Examples */}
          <section className="sdks-examples">
            <h2>💻 Exemples de Code</h2>
            <div className="examples-grid">
              <div className="example-card">
                <h3>🟨 JavaScript/Node.js</h3>
                <div className="code-block">
                  <code>
{`const response = await fetch('http://localhost:5001/api/analyze', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + firebaseToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: "Conditions générales à analyser...",
    options: {
      language: "fr",
      detailed: true
    }
  })
});

const result = await response.json();
console.log('Score:', result.transparencyScore);`}
                  </code>
                </div>
              </div>

              <div className="example-card">
                <h3>🐍 Python</h3>
                <div className="code-block">
                  <code>
{`import requests

headers = {
    'Authorization': f'Bearer {firebase_token}',
    'Content-Type': 'application/json'
}

data = {
    'text': 'Conditions générales à analyser...',
    'options': {
        'language': 'fr',
        'detailed': True
    }
}

response = requests.post(
    'http://localhost:5001/api/analyze',
    headers=headers,
    json=data
)

result = response.json()
print(f"Score: {result['transparencyScore']}")`}
                  </code>
                </div>
              </div>

              <div className="example-card">
                <h3>🌐 cURL</h3>
                <div className="code-block">
                  <code>
{`curl -X POST http://localhost:5001/api/analyze \\
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "text": "Conditions générales à analyser...",
    "options": {
      "language": "fr",
      "detailed": true
    }
  }'`}
                  </code>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive Documentation */}
          <section className="interactive-docs">
            <div className="docs-cta">
              <h2>📖 Documentation Interactive</h2>
              <p>
                Explorez l'API complète avec Swagger UI. Testez les endpoints directement 
                depuis votre navigateur avec une interface interactive.
              </p>
              <div className="docs-actions">
                <a 
                  href="http://localhost:5001/docs" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  🚀 Ouvrir Swagger UI
                </a>
                <a 
                  href="http://localhost:5001/health" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  ✅ Test de Santé API
                </a>
              </div>
            </div>
          </section>

          {/* Support */}
          <section className="api-support">
            <div className="support-card">
              <h3>🆘 Besoin d'Aide ?</h3>
              <p>
                Notre équipe technique est là pour vous accompagner dans l'intégration 
                de l'API TransparAI. N'hésitez pas à nous contacter !
              </p>
              <div className="support-actions">
                <Link to="/contact" className="btn btn-primary">
                  📧 Support Technique
                </Link>
                <Link to="/faq" className="btn btn-outline">
                  ❓ FAQ Développeurs
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;