import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const faqData: FAQItem[] = [
  // Getting Started
  {
    id: 'getting-started-1',
    category: 'Commencer',
    question: 'Comment créer un compte sur TransparAI ?',
    answer: 'Créer un compte est simple et gratuit ! Cliquez sur "S\'inscrire" en haut de la page, entrez votre adresse email et créez un mot de passe. Vous recevrez un email de confirmation à valider. Une fois votre email vérifié, vous avez accès à 20 analyses gratuites par mois avec le plan Starter.',
    tags: ['inscription', 'compte', 'gratuit']
  },
  {
    id: 'getting-started-2',
    category: 'Commencer',
    question: 'Comment analyser mon premier document ?',
    answer: 'Connectez-vous à votre compte et rendez-vous sur la page "Analyser". Vous pouvez soit uploader un fichier PDF, soit coller directement le texte de vos conditions générales. Cliquez sur "Lancer l\'analyse" et notre IA traitera votre document en quelques secondes. Vous obtiendrez un score de transparence, un résumé des points clés et une analyse détaillée.',
    tags: ['analyse', 'upload', 'PDF', 'premier']
  },
  {
    id: 'getting-started-3',
    category: 'Commencer',
    question: 'Quels types de documents puis-je analyser ?',
    answer: 'TransparAI peut analyser tous types de conditions générales d\'utilisation, conditions générales de vente, politiques de confidentialité, contrats SaaS, RGPD, et accords de service. Nous supportons les formats PDF et texte brut. Les documents peuvent être en français ou en anglais.',
    tags: ['types', 'documents', 'formats', 'langues']
  },

  // Plans and Pricing
  {
    id: 'pricing-1',
    category: 'Tarification',
    question: 'Quelles sont les différences entre les plans ?',
    answer: 'Plan Starter (Gratuit) : 20 analyses/mois, export PDF. Plan Standard (9,99€/mois) : 40 analyses/mois, historique sauvegardé, support prioritaire. Plan Premium (19,99€/mois) : analyses illimitées, comparaison multi-documents, tableaux de bord avancés, export multi-format. Plan Enterprise (99€/mois) : gestion multi-utilisateurs, audit complet, personnalisation de marque, SLA garanti.',
    tags: ['plans', 'différences', 'pricing']
  },
  {
    id: 'pricing-2',
    category: 'Tarification',
    question: 'Puis-je changer de plan à tout moment ?',
    answer: 'Oui, vous pouvez upgrader ou downgrader votre plan à tout moment depuis votre compte. Les changements prennent effet immédiatement. Si vous passez à un plan supérieur, vous serez facturé au prorata. Si vous downgrader, le crédit sera appliqué sur votre prochaine facture.',
    tags: ['changer', 'plan', 'upgrade', 'downgrade']
  },
  {
    id: 'pricing-3',
    category: 'Tarification',
    question: 'Comment fonctionne la facturation ?',
    answer: 'La facturation est mensuelle et automatique via Stripe (cartes de crédit sécurisées). Vous recevez une facture par email chaque mois. Vous pouvez annuler votre abonnement à tout moment sans frais. Aucune période d\'engagement minimum.',
    tags: ['facturation', 'paiement', 'Stripe', 'annulation']
  },
  {
    id: 'pricing-4',
    category: 'Tarification',
    question: 'Y a-t-il des frais cachés ?',
    answer: 'Non, aucun frais caché ! Le prix affiché est le prix final. Pas de frais d\'activation, pas de frais de résiliation, pas de coûts additionnels. Vous payez uniquement votre abonnement mensuel choisi.',
    tags: ['frais', 'cachés', 'transparent', 'prix']
  },

  // Features and Functionality
  {
    id: 'features-1',
    category: 'Fonctionnalités',
    question: 'Comment fonctionne le score de transparence ?',
    answer: 'Notre IA analyse votre document sur 50+ critères : clarté du langage, équité des clauses, présence d\'informations clés, facilité de résiliation, protection des données, etc. Le score va de 0 à 100. Un score élevé indique des conditions plus transparentes et équitables pour l\'utilisateur.',
    tags: ['score', 'transparence', 'critères', 'IA']
  },
  {
    id: 'features-2',
    category: 'Fonctionnalités',
    question: 'Puis-je comparer plusieurs documents ?',
    answer: 'Oui ! Avec les plans Premium et Enterprise, vous pouvez comparer jusqu\'à 3 documents (Premium) ou 5 documents (Enterprise) simultanément. Cela vous permet de voir les différences entre fournisseurs et choisir les conditions les plus favorables.',
    tags: ['comparaison', 'multi-documents', 'premium']
  },
  {
    id: 'features-3',
    category: 'Fonctionnalités',
    question: 'Où puis-je voir l\'historique de mes analyses ?',
    answer: 'Votre historique est disponible dans votre tableau de bord (plans Standard, Premium et Enterprise). Vous pouvez filtrer par date, score, type de document, et rechercher dans vos analyses passées. Le plan gratuit ne sauvegarde pas l\'historique.',
    tags: ['historique', 'tableau de bord', 'sauvegarde']
  },
  {
    id: 'features-4',
    category: 'Fonctionnalités',
    question: 'Quels formats d\'export sont disponibles ?',
    answer: 'Plan Starter et Standard : Export PDF. Plan Premium et Enterprise : Export PDF, Word (.docx) et Excel (.xlsx) pour les analyses détaillées et les rapports de comparaison. Tous les exports incluent votre logo et branding (Enterprise).',
    tags: ['export', 'formats', 'PDF', 'Word', 'Excel']
  },

  // Security and Privacy
  {
    id: 'security-1',
    category: 'Sécurité',
    question: 'Mes documents sont-ils sécurisés ?',
    answer: 'Absolument ! Nous utilisons un chiffrement de niveau bancaire (TLS/SSL). Vos documents sont supprimés automatiquement de nos serveurs après analyse. Nous ne conservons que les résultats d\'analyse (score, résumé) pour votre historique. Conformité RGPD garantie.',
    tags: ['sécurité', 'chiffrement', 'suppression', 'RGPD']
  },
  {
    id: 'security-2',
    category: 'Sécurité',
    question: 'Qui peut voir mes analyses ?',
    answer: 'Seul vous avez accès à vos analyses. Notre équipe technique ne peut pas voir le contenu de vos documents. Pour les comptes Enterprise, vous contrôlez les permissions d\'accès au sein de votre organisation (Admin, Manager, Analyste, Viewer).',
    tags: ['confidentialité', 'accès', 'permissions', 'enterprise']
  },
  {
    id: 'security-3',
    category: 'Sécurité',
    question: 'Utilisez-vous mes données pour entraîner votre IA ?',
    answer: 'Non, jamais ! Nous n\'utilisons pas vos documents personnels pour entraîner nos modèles d\'IA. Votre contenu reste privé et confidentiel. Nous améliorons notre IA uniquement avec des datasets publics et anonymisés.',
    tags: ['données', 'entrainement', 'IA', 'privé']
  },

  // Technical Support
  {
    id: 'support-1',
    category: 'Support',
    question: 'Comment obtenir de l\'aide ?',
    answer: 'Plusieurs options : 1) Cette FAQ pour les questions courantes, 2) Notre formulaire de contact pour le support email (réponse 24-48h), 3) Support prioritaire pour les plans Standard+ (réponse 12-24h), 4) Support dédié pour Enterprise avec formation équipe.',
    tags: ['support', 'aide', 'contact', 'prioritaire']
  },
  {
    id: 'support-2',
    category: 'Support',
    question: 'L\'analyse de mon document a échoué, que faire ?',
    answer: 'Vérifiez que votre fichier PDF n\'est pas protégé par mot de passe et fait moins de 10 Mo. Si le problème persiste, contactez-nous avec le message d\'erreur. Nous résolvons 95% des problèmes techniques dans les 24h.',
    tags: ['erreur', 'échec', 'PDF', 'technique']
  },
  {
    id: 'support-3',
    category: 'Support',
    question: 'Puis-je obtenir une formation pour mon équipe ?',
    answer: 'Oui ! Le plan Enterprise inclut une formation dédiée pour votre équipe. Nous proposons des sessions de 1h pour apprendre à utiliser efficacement TransparAI, interpréter les scores, et optimiser vos workflows d\'analyse contractuelle.',
    tags: ['formation', 'équipe', 'enterprise', 'session']
  },

  // Enterprise and Teams
  {
    id: 'enterprise-1',
    category: 'Entreprise',
    question: 'Comment fonctionne la gestion multi-utilisateurs ?',
    answer: 'Avec Enterprise, vous créez une organisation et invitez vos collaborateurs avec des rôles : Admin (gestion complète), Manager (analyses + rapports), Analyste (analyses uniquement), Viewer (lecture seule). Chaque utilisateur a son propre tableau de bord avec accès aux analyses partagées.',
    tags: ['multi-utilisateurs', 'rôles', 'organisation', 'permissions']
  },
  {
    id: 'enterprise-2',
    category: 'Entreprise',
    question: 'Puis-je personnaliser l\'interface avec mon logo ?',
    answer: 'Oui, le plan Enterprise permet de personnaliser l\'interface avec votre logo, vos couleurs de marque, et le nom de votre entreprise. Les exports PDF incluent également votre branding pour une présentation professionnelle.',
    tags: ['personnalisation', 'logo', 'branding', 'couleurs']
  },
  {
    id: 'enterprise-3',
    category: 'Entreprise',
    question: 'Qu\'est-ce que le journal d\'audit ?',
    answer: 'Le journal d\'audit (Enterprise) enregistre toutes les actions : qui a analysé quoi, quand, modifications des permissions, connexions, exports, etc. Essentiel pour la conformité et la traçabilité dans les grandes organisations.',
    tags: ['audit', 'journal', 'traçabilité', 'conformité']
  },

  // Accuracy and Limitations
  {
    id: 'accuracy-1',
    category: 'Précision',
    question: 'Quelle est la précision de l\'IA ?',
    answer: 'Notre IA atteint ~95% de précision sur l\'identification des clauses importantes et ~90% sur l\'évaluation de leur équité. Cependant, nos analyses sont à titre informatif uniquement. Pour des décisions juridiques importantes, consultez toujours un avocat spécialisé.',
    tags: ['précision', 'IA', 'juridique', 'limitation']
  },
  {
    id: 'accuracy-2',
    category: 'Précision',
    question: 'L\'IA peut-elle remplacer un avocat ?',
    answer: 'Non ! TransparAI est un outil d\'aide à la décision, pas un conseil juridique. Nous vous aidons à identifier les points d\'attention et à comprendre les enjeux, mais pour des contrats importants ou des litiges, consultez toujours un professionnel du droit.',
    tags: ['avocat', 'conseil', 'juridique', 'limitation']
  },
  {
    id: 'accuracy-3',
    category: 'Précision',
    question: 'Que faire si je ne suis pas d\'accord avec l\'analyse ?',
    answer: 'Notre IA peut parfois faire des erreurs d\'interprétation. Si vous pensez qu\'une analyse est incorrecte, contactez-nous avec les détails. Cela nous aide à améliorer continuellement nos algorithmes. Nous révisons chaque signalement dans les 48h.',
    tags: ['désaccord', 'erreur', 'amélioration', 'signalement']
  }
];

const categories = [
  'Tous',
  'Commencer',
  'Tarification',
  'Fonctionnalités',
  'Sécurité',
  'Support',
  'Entreprise',
  'Précision'
];

const FAQ: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState<string[]>([]);

  const filteredFAQ = faqData.filter(item => {
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const openAll = () => {
    setOpenItems(filteredFAQ.map(item => item.id));
  };

  const closeAll = () => {
    setOpenItems([]);
  };

  return (
    <div className="faq-container">
      <header className="faq-header">
        <div className="container">
          <Link to="/" className="back-link">← Retour à l'accueil</Link>
          <h1>Foire Aux Questions (FAQ)</h1>
          <p className="subtitle">Trouvez rapidement des réponses à vos questions sur TransparAI</p>
        </div>
      </header>

      <main className="faq-content">
        <div className="container">
          {/* Search and Filters */}
          <div className="faq-controls">
            <div className="search-section">
              <div className="search-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="bulk-actions">
              <button onClick={openAll} className="bulk-btn">Tout ouvrir</button>
              <button onClick={closeAll} className="bulk-btn">Tout fermer</button>
              <span className="results-count">
                {filteredFAQ.length} question{filteredFAQ.length > 1 ? 's' : ''} trouvée{filteredFAQ.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="faq-list">
            {filteredFAQ.length === 0 ? (
              <div className="no-results">
                <span className="no-results-icon">🤔</span>
                <h3>Aucune question trouvée</h3>
                <p>Essayez de modifier votre recherche ou votre filtre de catégorie.</p>
                <Link to="/contact" className="contact-link">
                  Posez votre question à notre équipe
                </Link>
              </div>
            ) : (
              filteredFAQ.map(item => (
                <div key={item.id} className="faq-item">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="faq-question"
                    aria-expanded={openItems.includes(item.id)}
                  >
                    <span className="category-badge">{item.category}</span>
                    <span className="question-text">{item.question}</span>
                    <span className={`toggle-icon ${openItems.includes(item.id) ? 'open' : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {openItems.includes(item.id) && (
                    <div className="faq-answer">
                      <p>{item.answer}</p>
                      <div className="faq-tags">
                        {item.tags.map(tag => (
                          <span key={tag} className="faq-tag">#{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Help Section */}
          <div className="faq-help">
            <div className="help-card">
              <h3>📞 Vous ne trouvez pas votre réponse ?</h3>
              <p>Notre équipe support est là pour vous aider ! Contactez-nous et nous vous répondrons dans les 24-48h.</p>
              <div className="help-actions">
                <Link to="/contact" className="btn btn-primary">
                  📧 Contacter le support
                </Link>
                <Link to="/help" className="btn btn-outline">
                  🛠️ Centre d'aide
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FAQ;