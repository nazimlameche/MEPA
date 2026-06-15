# AI-Edu

Plateforme d'apprentissage gamifiée pour enseigner l'utilisation des IA et leurs risques, développée en collaboration avec la CNIL.

## Démarrage rapide

### Prérequis

- [Node.js](https://nodejs.org/) v20+
- [pnpm](https://pnpm.io/) v9+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (PostgreSQL + Redis)

### Setup en une commande

```bash
bash scripts/setup-local.sh
```

Ce script :
1. Démarre PostgreSQL (port **5433**) et Redis (port **6380**) via Docker
2. Installe les dépendances (`pnpm install`)
3. Applique toutes les migrations SQL

### Variables d'environnement

Copie `.env.example` en `.env.local` (web) et `.env` (api) :

| Variable | Requis | Description |
|----------|--------|-------------|
| `AUTH_SECRET` | ✓ | Secret NextAuth v5 (min. 32 chars) |
| `AUTH_URL` | ✓ | `http://localhost:3000` |
| `AUTH_GOOGLE_ID` | OAuth | Client ID Google Cloud Console |
| `AUTH_GOOGLE_SECRET` | OAuth | Client Secret Google Cloud Console |
| `AUTH_OAUTH_SECRET` | OAuth | Secret serveur-à-serveur pour `/auth/oauth` |
| `DATABASE_URL` | ✓ | `postgresql://postgres:postgres@localhost:5433/aiedu` |
| `REDIS_URL` | ✓ | `redis://localhost:6380` |
| `MISTRAL_API_KEY` | ✓ | Clé API Mistral |
| `API_URL` | ✓ | `http://localhost:3001` (SSR) |
| `NEXT_PUBLIC_API_URL` | ✓ | `http://localhost:3001` (client) |

#### Google OAuth — configuration Google Cloud Console

1. Aller sur [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials
2. Créer un **OAuth 2.0 Client ID** de type "Web application"
3. **Origines JavaScript autorisées** : `http://localhost:3000`
4. **URI de redirection autorisés** : `http://localhost:3000/api/auth/callback/google`
5. Copier Client ID → `AUTH_GOOGLE_ID` et Client Secret → `AUTH_GOOGLE_SECRET`

### Lancer le projet

```bash
pnpm dev        # web (port 3000) + api (port 3001) en parallèle
```

## Structure

```
apps/web/       Next.js 15 — frontend
apps/api/       NestJS — backend
packages/shared TypeScript types partagés
scripts/        Scripts d'outillage
```

## Commandes utiles

```bash
pnpm --filter api run db:migrate  # appliquer les migrations
pnpm lint                          # ESLint
pnpm test                          # tests unitaires
```
