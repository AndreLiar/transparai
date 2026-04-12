# TransparAI — Analyse IA de CGU / CGA et contrats (SaaS)

Analyse intelligente et transparente des **conditions générales**, **CGU/CGV** et contrats grand public.

**Version :** SaaS 1.0 · **Mise à jour doc :** avril 2026 · **Auteur :** Kanmegne Tabouguie Andre Yvan

---

## Objectif

**TransparAI** permet d’analyser automatiquement des documents (PDF, texte, scan) : résumé clair, score de transparence, clauses sensibles signalées, export PDF selon le plan.

### Fonctionnalités principales

- Analyse IA via **OpenAI** (**GPT-4o** / **GPT-4o mini**) orchestrée côté serveur (LangChain), avec budgets et repli automatique vers le modèle le plus économique quand c’est nécessaire
- Analyse **streaming SSE** pour utilisateurs connectés (`/api/analyze/stream`) et invités (`/api/analyze/guest`)
- Paramètres IA (préférences, budget mensuel, opt-in premium) et statistiques d’usage
- OCR côté client (**Tesseract.js**) et PDF (**pdf.js**) avant envoi du texte à l’API
- Authentification **Firebase**, données métier **MongoDB** (profil, quotas, historique lié à l’UID Firebase)
- Paiements et abonnements **Stripe** (Checkout + webhooks)
- Suivi de documents (“Watch”): création, historique des changements, vérification manuelle, vérification planifiée
- Interface **React / TypeScript / Vite**, **i18next** (français prioritaire, anglais)
- Conformité RGPD : consentements, politique de confidentialité, suppression de compte

### API actuellement montée (backend)

`/api/dashboard`, `/api/analyze`, `/api/stripe`, `/api/export`, `/api/user`, `/api/profile`, `/api/ai-settings`, `/api/gdpr`, `/api/watch`, `/api/webhook` (+ `/health`, `/health/detailed`, `/docs`)

---

## Utilisateurs cibles

- Consommateurs (streaming, télécom, SaaS…)
- Étudiants et travailleurs nomades
- TPE/PME, indépendants, professionnels du droit (outil d’aide, pas un avis juridique)

---

## Auth (Firebase)

| Fonction | Inclus |
|----------|--------|
| Email / mot de passe | Oui |
| Mot de passe oublié | Oui |
| Vérification d’email | Oui |
| Magic link | Oui |
| Déconnexion | Oui |

L’**UID Firebase** est l’identifiant principal dans MongoDB (quotas, analyses, facturation).

---

## Plans (vue d’ensemble)

Les limites exactes (quotas, budgets IA, fonctionnalités) sont définies dans le code (`Backend/utils/planUtils.js`, `Backend/orchestrator/modelRouter.js`) et peuvent évoluer. En résumé :

| Plan | Rôle typique | IA documentaire |
|------|----------------|-----------------|
| **Free** / **Starter** (legacy) | Découverte | **GPT-4o mini** avec budget serré |
| **Standard** | Usage régulier | **GPT-4o mini** avec budget plus large ; **GPT-4o** possible selon préférences et budget |
| **Premium** / **Enterprise** | Équipes, volume | **GPT-4o** privilégié quand le budget le permet ; repli **GPT-4o mini** |

Stripe gère l’abonnement ; les webhooks mettent à jour le plan en base.

---

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Frontend | React 19, TypeScript, Vite, Bootstrap, Firebase SDK, i18next |
| Backend | Node.js, Express, Mongoose, Firebase Admin, Stripe |
| Analyse documentaire | OpenAI API (**GPT-4o**, **GPT-4o mini**) via LangChain |
| OCR / PDF client | Tesseract.js, pdf.js |
| Base de données | MongoDB (Atlas ou tout cluster compatible `mongodb://` / `mongodb+srv://`) |
| Paiement | Stripe |
| Hébergement typique | **Vercel** (front) + **Render** (API) — autres fournisseurs possibles |

---

## Variables d’environnement (rappel)

**Backend** (voir `Backend/.env.example`) : au minimum `MONGO_URI`, `FIREBASE_SERVICE_ACCOUNT_JSON`, **`OPENAI_API_KEY`**, secrets Stripe, `JWT_SECRET`, `ENCRYPTION_KEY`, `SESSION_SECRET`, `FRONTEND_URL`. Optionnel : `OPENAI_BASE_URL`, `VOYAGE_API_KEY`, monitoring, etc.

`RUN_WATCHER_CRON=true` active la tâche planifiée de surveillance documentaire; à configurer sur une seule instance en production.
`RATE_LIMIT_STORE=mongo` active un stockage distribué des quotas de rate limit (recommandé en multi-instance).

**Frontend** (voir `frontend/.env.example`) : `VITE_API_BASE_URL`, clés `VITE_FIREBASE_*`.

> En production, `VITE_API_BASE_URL` doit être défini explicitement (pas de fallback implicite vers localhost).

---

## Installation locale

```bash
git clone <url-de-votre-depot>
cd transparai

# Frontend
cd frontend
npm install
npm run dev

# Backend (autre terminal)
cd ../Backend
npm install
npm run dev
```

Configurer les fichiers `.env` à partir des `.env.example` de chaque dossier. L’API écoute en général le port **5000** en dev ; le front **5173** (ajuster `VITE_API_BASE_URL` si besoin).

### Commandes utiles

```bash
# Backend
cd Backend
npm test
npm run lint

# Frontend
cd frontend
npm run test:run
npm run build
npm run lint
npm run test:e2e
```

---

## Sécurité et RGPD

- Traitement des documents avec consentement explicite pour l’IA (voir flux produit et politique de confidentialité).
- Auth et sessions gérées via Firebase ; pas de stockage arbitraire du texte des contrats sans politique claire.

---

## Licence

**MIT** — utilisation, modification et redistribution possibles avec mention de la paternité.
