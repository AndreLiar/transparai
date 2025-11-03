

````markdown
# 📘 TransparAI – AI CGA Analyzer (SaaS)

> Analyse intelligente et transparente des **Conditions Générales d’Abonnement (CGA)** pour tous.

Version : SaaS 1.0 
Date : Avril 2025  
Auteur :Kanmegne Tabouguie Andre yvan

---

## 🚀 Objectif

**TransparAI** est une plateforme SaaS qui permet aux utilisateurs d’analyser automatiquement leurs CGA (PDF, texte, ou scan), de détecter des clauses sensibles, et de recevoir un rapport clair et exploitable.

Fonctionnalités clés :
- 🔍 Analyse IA (via **Gemini 2.0 Flash** + **GPT modèles premium**)
- 🤖 **Paramètres IA avancés** avec sélection de modèles intelligente
- 💰 **Gestion budgétaire IA** avec tracking des coûts et usage
- 📊 **Statistiques d'utilisation** détaillées (GPT vs Gemini)
- 📄 OCR intégré (Tesseract.js)
- 📊 Score de transparence (0–100 ou A–F)
- 🧠 Résumé intelligent
- 🚩 Détection des clauses abusives
- 📥 Export PDF
- 🔐 Auth complète avec **Firebase Authentication**
- 💳 Abonnement via **Stripe**
- 🧾 Historique lié à l'UID Firebase
- 🔒 Conforme RGPD
- 🔍 Analyse IA via **Gemini 2.0 Flash** produisant résumé, score et clauses détectées
- 📄 Support texte, PDF et images : extraction natif ou OCR (pdf.js + Tesseract)
- 📊 Quotas quotidiens par plan (2, 10 ou illimité) remis à zéro automatiquement
- 🧾 Historique des analyses et export PDF pour les abonnés payants
- 💳 Abonnement via **Stripe** (Checkout + webhooks) avec mise à jour du plan
- 🔐 Authentification Firebase (email, magic link, reset, vérif. email) avec déconnexion synchronisée entre onglets
- 🗑 Suppression de compte dans Firebase et MongoDB
- 🔒 Routes protégées nécessitant un email vérifié
- 🏠 Tableau de bord React pour accéder à Analyse, Infos, Historique et Upgrade
- ✅ Conforme RGPD

---

## 👤 Utilisateurs Cibles

- Consommateurs abonnés (streaming, télécom, SaaS…)
- Étudiants et travailleurs nomades
- Indépendants, TPE/PME, juristes

---

## 🧩 Fonctionnalités Auth (Firebase)

| Fonction | Inclus |
|---------|--------|
| Email / Mot de passe | ✅ |
| Mot de passe oublié | ✅ |
| Vérification d’email | ✅ |
| Connexion anonyme | ✅ |
| Magic Link | ✅ |
| JWT & Règles de sécurité | ✅ |
| Déconnexion | ✅ |

> 🔗 L'UID Firebase est utilisé comme identifiant unique dans MongoDB pour lier les quotas, analyses et paiements.

---

## 💳 Plans & Tarification

| Plan | Prix | Requêtes / jour | Budget IA | Modèles IA | Fonctions incluses |
|------|------|------------------|-----------|------------|---------------------|
| Free | Gratuit | 10 | $0/mois | Gemini uniquement | Analyse, OCR, export |
| Standard | 2€/mois | 40 | $2/mois | Gemini + GPT-3.5 | + Historique, support, IA premium |
| Premium | 10€/mois | ∞ | $10/mois | Tous modèles | + GPT-4, analyses illimitées |
| Enterprise | 50€/mois | ∞ | $50/mois | Tous modèles | + Support prioritaire, API |

### 🤖 Fonctionnalités IA Avancées
- **Sélection automatique** de modèle basée sur la complexité du document
- **Budget mensuel** dédié aux modèles GPT premium
- **Statistiques d'usage** détaillées (coûts, analyses, modèles utilisés)
- **Fallback intelligent** vers Gemini si budget épuisé
- **Paramètres personnalisables** pour autoriser/interdire l'IA premium

- Paiement via **Stripe Checkout**
- Suivi automatisé via **webhooks**
- Quotas gérés par `firebaseUid` dans MongoDB

---

## 🧱 Stack Technique

| Composant | Stack |
|----------|-------|
| Frontend | React.js + TypeScript + Bootstrap |
| Backend | Node.js + Express.js |
| IA | Gemini 2.0 Flash + GPT-4/3.5 Turbo |
| Gestion IA | Sélection automatique + Budget tracking |
| OCR | Tesseract.js |
| Auth | Firebase Authentication |
| DB | MongoDB (User profiles + AI settings) |
| Paiement | Stripe SDK + Webhooks |
| Hébergement | Vercel (Front) + Render (API) |

---

## 🧪 Parcours Utilisateur

1. 🔐 Authentification (Firebase)
2. 🤖 **Configuration IA** (sélection modèle, budget)
3. 🧾 Upload de CGA (PDF / texte / OCR)
4. ⚙️ Analyse IA intelligente (auto-sélection modèle)
5. 📊 Résultats (score, résumé, alertes + coût IA)
6. 📥 Export PDF
7. 📁 Historique (selon forfait)
8. 📈 **Statistiques d'usage IA** (analyses, coûts, modèles)
9. 👤 Gestion du compte
10. ⬆️ Mise à niveau du plan via Stripe
11. 👤 Gestion et suppression du compte

---

## 🤖 Paramètres IA Avancés (Nouveau!)

### 💰 Gestion Budgétaire Intelligente
- **Budget mensuel** alloué selon le plan d'abonnement
- **Tracking en temps réel** des coûts d'utilisation IA
- **Alertes automatiques** quand le budget approche de la limite
- **Reset mensuel** automatique du budget utilisé

### 🎯 Sélection de Modèles IA
- **Auto (Recommandé)** : Sélection automatique selon la complexité
- **Gemini 2.0 Flash** : Gratuit et rapide pour analyses basiques
- **GPT-3.5 Turbo** : Équilibré performance/coût ($0.003/1K tokens)
- **GPT-4 Turbo** : Le plus avancé pour documents complexes ($0.015/1K tokens)

### 📊 Algorithme de Sélection Intelligente
1. **Analyse de complexité** : Termes juridiques, structure, conditionnels
2. **Vérification budget** : Coût estimé vs budget restant
3. **Préférences utilisateur** : Modèle choisi + autorisation premium
4. **Fallback automatique** : Gemini si budget insuffisant

### 📈 Statistiques d'Usage
- **Analyses totales** et répartition par modèle (GPT vs Gemini)
- **Coûts détaillés** avec coût moyen par analyse
- **Historique d'utilisation** et tendances mensuelles
- **Performance budgétaire** avec pourcentage utilisé

---

## 🔒 Sécurité & RGPD

- Aucun texte CGA n’est conservé sans consentement explicite
- Sessions sécurisées avec Firebase


---
## 🛠️ Installation Locale (dev)

```bash
# Cloner le repo
git clone https://github.com/zkerkeb-class/projet-final-back-AndreLiar

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd ../backend
npm install
npm run dev

# Configurer .env avec Firebase + Mongo + Stripe
````

---


## © Licence

Distribué sous licence **MIT**.
Utilisation, modification et redistribution autorisées avec attribution.

---
