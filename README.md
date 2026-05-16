# TransparAI — Analyse IA de CGU / CGA et contrats (SaaS)

Analyse intelligente et transparente des **conditions générales**, **CGU/CGV** et contrats grand public.

**Version :** SaaS 1.0 · **Mise à jour doc :** mai 2026 · **Auteur :** Kanmegne Tabouguie Andre Yvan

---

## Objectif

**TransparAI** permet d'analyser automatiquement des documents (PDF, texte, scan) : résumé clair, score de transparence, clauses sensibles signalées, export PDF selon le plan.

### Fonctionnalités disponibles

- Analyse IA via **OpenAI** (**GPT-4o** / **GPT-4o mini**) orchestrée côté serveur (LangChain), avec budgets et repli automatique vers le modèle le plus économique
- Analyse **streaming SSE** pour utilisateurs connectés (`/api/analyze/stream`) et invités (`/api/analyze/guest`) — 3 analyses/jour sans compte
- OCR côté client (**Tesseract.js**) et PDF (**pdf.js**) avant envoi du texte à l'API
- Authentification **Firebase** (email/mot de passe, magic link, vérification email, réinitialisation)
- Données métier **MongoDB** (profil, quotas, historique lié à l'UID Firebase)
- Paiements et abonnements **Stripe** (Checkout + webhooks)
- Suivi de documents ("Watch") : création, historique des changements, vérification manuelle, vérification planifiée (cron activable via `RUN_WATCHER_CRON=true`)
- Paramètres IA : préférences de modèle, budget mensuel, opt-in premium, statistiques d'usage
- Historique des analyses avec pagination (`/history`)
- Export PDF des rapports d'analyse
- Conformité RGPD : consentements granulaires, export des données, suppression de compte
- Interface **React 19 / TypeScript / Vite**, **i18next** (français prioritaire, anglais)
- Smoke tests automatiques toutes les 15 minutes sur le frontend et le backend

### API montée (backend)

`/api/dashboard`, `/api/analyze`, `/api/stripe`, `/api/export`, `/api/user`, `/api/profile`, `/api/ai-settings`, `/api/gdpr`, `/api/watch`, `/api/webhook` (+ `/health`, `/health/detailed`, `/docs`)

---

## Utilisateurs cibles

- Consommateurs (streaming, télécom, SaaS…)
- Étudiants et travailleurs nomades
- TPE/PME, indépendants, professionnels du droit (outil d'aide, pas un avis juridique)

---

## Auth (Firebase)

| Fonction | Inclus |
|----------|--------|
| Email / mot de passe | Oui |
| Mot de passe oublié | Oui |
| Vérification d'email | Oui |
| Magic link | Oui |
| Déconnexion | Oui |

L'**UID Firebase** est l'identifiant principal dans MongoDB (quotas, analyses, facturation).

---

## Plans (vue d'ensemble)

Les limites exactes (quotas, budgets IA, fonctionnalités) sont définies dans le code (`Backend/utils/planUtils.js`, `Backend/orchestrator/modelRouter.js`). En résumé :

| Plan | Prix | Analyses/mois | Fonctionnalités clés |
|------|------|--------------|----------------------|
| **Free** | Gratuit | 5 | Texte uniquement, analyse de base |
| **Standard** | €14.99/mois | 100 | Upload PDF/image, export PDF, historique |
| **Premium** | €29.99/mois | Illimité | GPT-4o prioritaire, accès API |
| **Enterprise** | €199/mois | Illimité | GPT-4o prioritaire, accès API |

Stripe gère l'abonnement ; les webhooks mettent à jour le plan en base.

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 19, TypeScript, Vite, Bootstrap, Firebase SDK, i18next |
| Backend | Node.js, Express 5, Mongoose, Firebase Admin, Stripe |
| Analyse documentaire | OpenAI API (**GPT-4o**, **GPT-4o mini**) via LangChain |
| OCR / PDF client | Tesseract.js, pdf.js |
| Base de données | MongoDB (Atlas ou tout cluster compatible) |
| Paiement | Stripe |
| Hébergement | **Vercel** (frontend) + **Render** (API) |
| CI/CD | GitHub Actions — tests, audit sécurité, build Docker, deploy Render |
| Monitoring | Smoke tests toutes les 15 min (GitHub Actions) |

---

## Variables d'environnement

**Backend** (voir `Backend/.env.example`) :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `MONGO_URI` | Oui | URI MongoDB |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Oui | Clé service Firebase Admin |
| `OPENAI_API_KEY` | Oui | Clé API OpenAI |
| `STRIPE_SECRET_KEY` | Oui | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Oui | Secret webhook Stripe |
| `JWT_SECRET` | Oui | Secret JWT |
| `ENCRYPTION_KEY` | Oui | Clé de chiffrement |
| `SESSION_SECRET` | Oui | Secret de session |
| `FRONTEND_URL` | Oui | URL du frontend (ex: `https://transparai.vercel.app`) |
| `RUN_WATCHER_CRON` | Non | `true` pour activer les vérifications auto des documents surveillés (une seule instance) |
| `RATE_LIMIT_STORE` | Non | `mongo` pour le rate limiting distribué (multi-instance) |
| `OPENAI_BASE_URL` | Non | URL de base compatible OpenAI (proxy ou endpoint tiers) |

**Frontend** (voir `frontend/.env.example`) :

| Variable | Obligatoire | Description |
|----------|-------------|-------------|
| `VITE_API_BASE_URL` | Oui | URL de l'API backend (ex: `https://transparai.onrender.com`) |
| `VITE_FIREBASE_*` | Oui | Clés Firebase (apiKey, authDomain, projectId, etc.) |

> En production, `VITE_API_BASE_URL` doit être défini explicitement — pas de fallback vers localhost.

**GitHub Secrets (CI/CD)** :

| Secret | Description |
|--------|-------------|
| `FRONTEND_URL` | URL Vercel — utilisée par les smoke tests |
| `BACKEND_URL` | URL Render — utilisée par les smoke tests |

---

## Installation locale

```bash
git clone <url-de-votre-depot>
cd transparai

# Frontend
cd frontend
cp .env.example .env   # remplir les variables Firebase et API URL
npm install
npm run dev

# Backend (autre terminal)
cd ../Backend
cp .env.example .env   # remplir toutes les variables requises
npm install
npm run dev
```

L'API écoute sur le port **5000** en dev ; le frontend sur **5173**.

### Commandes utiles

```bash
# Backend
cd Backend
npm test              # Jest
npm run lint          # ESLint

# Frontend
cd frontend
npm run test:run      # Vitest (single run)
npm run build         # tsc + vite build
npm run lint          # ESLint
```

---

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/`) comprend :

1. **CD** (`cd.yml`) — déclenché sur push `main` touchant `Backend/` :
   - Tests Jest + audit sécurité npm
   - Build et push image Docker (GitHub Container Registry)
   - Deploy sur Render via webhook (attend que le service soit live)

2. **CI** (`ci.yml`) — déclenché sur les PRs :
   - Vérification du build frontend

3. **Frontend Smoke** (`frontend-smoke.yml`) — toutes les 15 minutes :
   - Vérifie homepage, page login (Vercel) et `/health` (Render)
   - Requiert les secrets `FRONTEND_URL` et `BACKEND_URL`

---

## Sécurité et RGPD

- Consentement explicite requis pour le traitement IA des documents (RGPD Art. 22)
- Auth et sessions gérées via Firebase
- Clés API externes stockées hachées (SHA-256) en base
- Headers de sécurité via Helmet, protection NoSQL injection, sanitisation des inputs
- Validation du webhook Stripe par signature (raw body)
- Anti-énumération sur les endpoints d'authentification

---

## Licence

**MIT** — utilisation, modification et redistribution possibles avec mention de la paternité.
