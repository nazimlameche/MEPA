# AI-Edu — CLAUDE.md

Plateforme d'apprentissage gamifiée (Duolingo-like) sur l'IA et ses risques.
Public : collégiens (dès 11 ans), lycéens, enseignants. Projet académique CNIL.

---

## Stack

| Couche | Techno |
|--------|--------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | Next.js 15 App Router + TypeScript + Tailwind v4 |
| UI | shadcn/ui + Radix UI + Framer Motion |
| Backend | NestJS + TypeScript |
| Auth | NextAuth.js v5 — rôles : `student \| teacher \| admin` |
| BDD | PostgreSQL 16 + Redis 7 |
| LLM | Mistral AI `mistral-small-latest` (La Plateforme, free tier) |
| CI/CD | GitHub Actions → Docker Compose → VPS OVHcloud (EU) |

---

## Commandes courantes

```bash
pnpm dev              # Lance web (3000) + api (3001) en parallèle
pnpm build            # Build tous les packages
pnpm lint             # ESLint sur tout le monorepo
pnpm test             # Jest sur tous les packages
pnpm db:migrate       # Applique les migrations SQL
pnpm db:studio        # Ouvre l'UI de la BDD (Drizzle Studio ou pgAdmin)

# Docker
docker compose up -d          # Lance PostgreSQL + Redis
docker compose down -v        # Arrête et supprime les volumes

# Dans apps/api
pnpm nest g module modules/xxx    # Génère un nouveau module NestJS
pnpm nest g service modules/xxx   # Génère un service
pnpm nest g controller modules/xxx # Génère un controller
```

---

## Architecture des modules

Chaque module d'apprentissage implémente `LearningModuleConfig` depuis `@shared/types`.
Pour ajouter M5 : créer `apps/api/src/modules/m5-xxx/` + enregistrer dans `module-registry`.
Ne jamais modifier `app.module.ts` pour ajouter un module métier — passer par le registre.

```
packages/shared/src/types/learning-module.interface.ts  ← interface à respecter
apps/api/src/core/module-registry/                      ← registre central
apps/api/src/modules/                                   ← un dossier par module
apps/web/app/(app)/modules/[moduleId]/                  ← route dynamique front
```

---

## Règles de code — non négociables

- **TypeScript strict** : zéro `any`, zéro `as unknown`. Si tu ne sais pas le type, demande.
- **Nommage** : `kebab-case` pour les fichiers, `PascalCase` pour les classes, `camelCase` pour les fonctions.
- **Imports** : utiliser les alias (`@/components/...` côté web, `@shared/...` pour le package partagé).
- **Tests** : tout service NestJS a son `*.spec.ts`. Minimum : tester les cas nominaux et les cas d'erreur.
- **DTOs** : validation avec `class-validator` sur tous les inputs NestJS. Jamais de donnée brute en BDD.
- **Secrets** : toujours `process.env.VAR_NAME`, jamais hardcodé. Les variables sont dans `.env.example`.

---

## Contraintes CNIL — règles dures

> Violation de ces règles = bug critique, pas un avertissement.

1. **Zéro PII dans les prompts Mistral** — anonymiser avant tout appel LLM.
   Les intérêts du questionnaire (M4) ne doivent jamais contenir nom, email, ni identifiant.

2. **Zero-retention obligatoire** — tout appel à l'API Mistral doit inclure le header :
   ```typescript
   headers: { 'X-No-Cache': 'true' }
   ```

3. **IP jamais stockée en clair** — dans `audit_logs`, toujours `SHA-256(ip)` :
   ```typescript
   const ipHash = crypto.createHash('sha256').update(ip).digest('hex');
   ```

4. **Consentement parental** — si `birthYear` indique < 15 ans, bloquer l'accès
   jusqu'à validation du flow `consent/` avec email parental. Champ `parental_consent` en BDD.

5. **Droit à l'effacement** — `DELETE /users/:id` doit faire une cascade sur :
   `user_progress`, `quiz_attempts`, `sandbox_sessions`, `generated_courses`, `audit_logs`.

6. **Hébergement UE** — ne jamais suggérer Vercel, AWS us-east, ou tout provider non-UE pour la prod.
   OVHcloud Strasbourg ou Hetzner Helsinki uniquement.

7. **Sandbox (M3)** — toujours afficher `ModerationBanner` rappelant que l'IA peut se tromper.
   Rate-limit : 10 messages/minute/utilisateur via Redis.

---

## Base de données — tables principales

```
users               → id, email, role, birth_year, consent_given, parental_consent
courses             → id, module_id, title, level, tier, content_blocks (JSONB), xp_reward
course_tags         → course_id, tag (many-to-many)
exercises           → id, course_id, type, instructions, expected_output
user_progress       → user_id, course_id, status, score, xp_earned, streak_count
quiz_attempts       → id, user_id, exercise_id, answer, is_correct, xp_earned, feedback
sandbox_sessions    → id, user_id, messages (JSONB chiffré AES-256), expires_at (TTL 30j)
generated_courses   → id, user_id, interests (JSONB anonymisé), content (JSONB)
audit_logs          → id, user_id, action, resource, ip_hash (SHA-256), created_at
```

Les migrations sont dans `apps/api/src/shared/database/migrations/`.

---

## Endpoints API — structure

```
POST   /api/auth/register        → inscription + vérification âge
POST   /api/auth/login           → connexion
GET    /api/modules              → liste des modules actifs (depuis module-registry)
GET    /api/courses              → liste avec filtres ?moduleId=&tag=&level=
GET    /api/courses/:id          → détail d'un cours
POST   /api/progress/:courseId   → marquer cours en cours / complété
GET    /api/users/me             → profil + XP + streak
GET    /api/users/me/data        → export RGPD (droit d'accès)
DELETE /api/users/:id            → suppression cascade (droit à l'effacement)
POST   /api/sandbox/message      → envoi message chatbot (rate-limited)
POST   /api/custom-course/generate → génération cours sur-mesure
```

---

## Ce qu'il ne faut PAS faire

- Ne pas utiliser `localStorage` pour stocker des tokens — Redis sessions côté serveur.
- Ne pas appeler l'API Mistral depuis le frontend — toujours passer par le backend NestJS.
- Ne pas créer de nouveau module sans implémenter `LearningModuleConfig` et l'enregistrer.
- Ne pas faire de requête SQL brute — utiliser l'ORM (TypeORM entities et repositories).
- Ne pas skipper les tests : si tu génères un service, génère son spec en même temps.