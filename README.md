

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
- 🔍 Analyse IA (via **Gemini 2.0 Flash**)
- 📄 OCR intégré (Tesseract.js)
- 📊 Score de transparence (0–100 ou A–F)
- 🧠 Résumé intelligent
- 🚩 Détection des clauses abusives
- 📥 Export PDF
- 🔐 Auth complète avec **Firebase Authentication**
- 💳 Abonnement via **Stripe**
- 🧾 Historique lié à l’UID Firebase
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

| Plan | Prix | Requêtes / jour | Fonctions incluses |
|------|------|------------------|---------------------|
| Starter | Gratuit | 10 | Analyse, OCR, export |
| Standard | 2€/mois | 40 | + Historique, support |
| Premium | 5€/mois | ∞ | + Accès bêta, illimité |

- Paiement via **Stripe Checkout**
- Suivi automatisé via **webhooks**
- Quotas gérés par `firebaseUid` dans MongoDB

---

## 🧱 Stack Technique

| Composant | Stack |
|----------|-------|
| Frontend | React.js + Bootstrap |
| Backend | Node.js + Express.js |
| IA | Gemini 2.0 Flash |
| OCR | Tesseract.js |
| Auth | Firebase Authentication |
| DB | MongoDB |
| Paiement | Stripe SDK + Webhooks |
| Hébergement | Vercel (Front) + Render (API) |

---

## 🧪 Parcours Utilisateur

1. 🔐 Authentification (Firebase)
2. 🧾 Upload de CGA (PDF / texte / OCR)
3. ⚙️ Analyse IA
4. 📊 Résultats (score, résumé, alertes)
5. 📥 Export PDF
6. 📁 Historique (selon forfait)
7. 👤 Gestion du compte
7. ⬆️ Mise à niveau du plan via Stripe
8. 👤 Gestion et suppression du compte

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
