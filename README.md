

````markdown
# 📘 TransparAI – AI CGA Analyzer (SaaS)

> Analyse intelligente et transparente des **Conditions Générales d’Abonnement (CGA)** pour tous.

Version : SaaS 1.0 
Date : Avril 2025  
Auteur : Solo Developer – [Votre Nom ou Alias]  

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

---

## 🔒 Sécurité & RGPD

- Aucun texte CGA n’est conservé sans consentement explicite
- Sessions sécurisées avec Firebase
- Chiffrement des paiements
- Accès conditionnel via règles Firebase (`auth.uid`, `email_verified`…)

---

## 📦 Livrables du Projet

- ✅ Frontend React (UI, Auth, OCR, affichage résultat)
- ✅ Backend Express (API sécurisées + webhooks)
- ✅ Intégration Firebase Auth complète
- ✅ Paiement PayPal + quotas dynamiques
- ✅ Export PDF automatisé
- ✅ Modèle MongoDB lié à `firebaseUid`
- ✅ Scripts & documentation de déploiement
- ✅ Cas de test CGA

---

## 📚 Liens Utiles (Notion)

- [Cahier des Charges](https://www.notion.so/1-Cahier-des-Charges-Functional-Non-Functional-Specs-1e555d323f54804abb0bf3388ce36152?pvs=21)
- [Parcours Utilisateur](https://www.notion.so/Parcours-Utilisateur-Version-Compl-te-SaaS-1-2-1e555d323f5480a4be2ac61efc4b9aff?pvs=21)
- [Vision Produit](https://www.notion.so/Vision-Statement-1e455d323f5480aa9903da7794e23bb8?pvs=21)
- [Structure Auth Firebase](https://www.notion.so/auth-1df55d323f548058bb46efd36ec92a68?pvs=21)
- [Base MongoDB](https://www.notion.so/mongodb-1e955d323f5480babf0cffc74471e8f3?pvs=21)
- [Backend + Webhooks](https://www.notion.so/backend-1e955d323f5480a8abd7d5c889e27b59?pvs=21)

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

## 🤝 Contribuer

Ce projet est solo-dev pour l’instant, mais toute aide ou feedback est bienvenu !
Fork, issue ou PR sont les bienvenus.

---

## © Licence

Distribué sous licence **MIT**.
Utilisation, modification et redistribution autorisées avec attribution.

---
