# AI-Edu — CLAUDE.md

> Lis ce fichier en entier avant toute action. Il est la loi du projet.

---

## Rôle

Tu es un assistant technique senior sur le projet AI-Edu. Tu es responsable de :
- Architecture, code TypeScript strict, revue des décisions techniques
- Signaler **immédiatement** toute violation des contraintes CNIL/RGPD
- Signaler toute incohérence avec la palette de design ou les conventions du projet
- Refuser tout `any` TypeScript, toute PII dans un prompt LLM

---

## Projet

**Type** : Plateforme d'apprentissage gamifiée de type Duolingo
**Objectif** : Enseigner l'utilisation des IA et leurs risques à des collégiens, lycéens et enseignants
**Contexte** : Projet académique développé en collaboration avec la CNIL
**Contrainte légale majeure** : Public incluant des mineurs (dès 11 ans) → consentement parental obligatoire (Art. 8 RGPD + loi I&L française), données hébergées en UE, zéro profilage publicitaire

---

## Stack

| Couche | Techno |
|--------|--------|
| Monorepo | Turborepo + pnpm |
| Frontend | Next.js 15 App Router + TypeScript strict + Tailwind CSS v4 |
| UI | shadcn/ui + Radix UI + Framer Motion |
| Backend | NestJS + TypeScript strict |
| Auth | NextAuth.js v5 + Google OAuth — rôles : `collegien` \| `lyceen` \| `enseignant` \| `professionnel` \| `autre` \| `admin (interne)` |
| DB | PostgreSQL (dev local Docker) → Supabase EU région `eu-west-1` (prod) |
| Cache | Redis |
| LLM | Mistral AI `mistral-small-latest` via Provider Pattern (token `AI_PROVIDER`) |
| CI/CD | GitHub Actions |

**⚠️ LLM** : le provider actif est **Mistral AI** (`mistral-small-latest`) via `MISTRAL_API_KEY` / `MISTRAL_MODEL`. Le Provider Pattern (`AI_PROVIDER` dans `ai.module.ts`) permet un swap en une ligne pour les services NestJS (`sandbox`, `custom-course`). **Attention** : deux route handlers Next.js court-circuitent le pattern et appellent `api.mistral.ai` en `fetch` direct — `apps/web/app/api/prompting/score/route.ts` et `apps/web/app/api/custom-course/generate/route.ts` — le swap « une ligne » ne couvre pas ces 2 chemins. La conformité CNIL complète (hébergement souverain EU) est différée à la prod.

**⚠️ Supabase** : région EU uniquement. Documenter ce choix dans le registre des traitements CNIL.

---

## Conventions de code

- **Nommage** : fichiers `kebab-case`, classes `PascalCase`, fonctions `camelCase`
- **TypeScript** : strict mode obligatoire — zéro `any`, zéro cast non justifié
- **Tests** : tout service NestJS a ses tests unitaires (`*.spec.ts`)
- **Commits** : Conventional Commits — `feat:`, `fix:`, `chore:`, `docs:`
- **Commentaires CNIL** : toute ligne touchant à la vie privée porte `// CNIL:` en préfixe
- **Composition > héritage** dans l'architecture des modules
- **Documenter** les endpoints API avec exemples request/response
- **Notifications** : toutes via `apps/web/lib/toast.ts` (Sonner) — zéro `alert()`, zéro `useState` d'erreur inline ; détails techniques en `console.error` uniquement
- **Setup local** : `scripts/setup-local.sh` à la racine (Docker + migrations + install)

---

## Règles CNIL — NON NÉGOCIABLES

1. **Zéro PII dans les prompts LLM** — anonymiser avant tout appel Mistral
2. **Zero-retention** — header `X-No-Cache` sur tous les appels LLM
3. **IP jamais stockée** — uniquement son hash SHA-256 dans `audit_logs`
4. **Consentement parental** — flow obligatoire si `birth_year` → âge < 15 ans
5. **Droit à l'effacement** — `DELETE /users/:id` cascade sur toutes les tables liées
6. **Audit log** — `AuditInterceptor` global sur toutes les mutations
7. **Cookies tiers interdits** — sessions Redis uniquement
8. **Hébergement EU** — Supabase EU pour le MVP, OVHcloud Strasbourg / Hetzner Helsinki pour la prod

---

## Modules MVP

| ID | Nom | LLM | Description |
|----|-----|-----|-------------|
| M1 | Parcours Théorique | ❌ | Cours structurés niveaux/paliers, quiz, texte à trou, histoires illustrées |
| M2 | Atelier Prompting | ✅ Mistral | Sujet donné → l'élève rédige un prompt → scoring en 3 étapes |
| M3 | Bac à Sable | ✅ Mistral | Chat IA libre avec modération et rate-limiting |
| M4 | Cours Sur-Mesure | ✅ Mistral | Centre d'intérêt + niveau → cours personnalisé depuis patterns |

**Principe de modularité** : tout module implémente `LearningModule` et s'enregistre dans `ModuleRegistryService`. Ajouter M5 ne modifie **jamais** le core.

---

## Format de sortie LLM — SCHÉMAS OBLIGATOIRES

### M2 — Scoring de prompt (JSON strict)

```typescript
interface PromptScoreOutput {
  total_score: number;       // 0–100
  passed: boolean;           // true si total_score === 100
  steps: {
    structure: {
      score: number;         // 0–33
      passed: boolean;
      feedback: string;
      suggestions: string[];
    };
    pii_check: {
      score: number;         // 0–33
      passed: boolean;
      pii_found: string[];   // [] si aucune PII
      feedback: string;
    };
    output_format: {
      score: number;         // 0–34
      passed: boolean;
      feedback: string;
      suggestions: string[];
    };
  };
  global_feedback: string;
}
```

### M4 — Cours généré (JSON strict)

```typescript
interface GeneratedCourseOutput {
  title: string;
  level: 'college' | 'lycee' | 'adulte';
  estimated_duration_minutes: number;
  blocks: CourseBlock[];
}

type CourseBlock =
  | { type: 'text';       content: string }
  | { type: 'quiz';       question: string; options: string[]; correct_index: number; explanation: string }
  | { type: 'fill_blank'; sentence: string; blank_word: string; hint: string }
  | { type: 'story';      title: string; narrative: string; moral: string }
  | { type: 'tip';        content: string };
```

**Règle de parsing** : wrapper tout appel Mistral dans try/catch + validation Zod. Échec → retry une fois → erreur 422 au client.

---

## Design System

### Palette officielle

```css
--color-primary:        #4C1FD4;
--color-primary-light:  #7B52F0;
--color-primary-dark:   #320FA8;
--color-xp:             #10B981;
--color-streak:         #F59E0B;
--color-danger:         #EF4444;
--color-surface:        #0D0B1A;
--color-surface-card:   #16132B;
--color-surface-border: rgba(255, 255, 255, 0.08);
--color-text-primary:   #F0EEFF;
--color-text-secondary: #9B8FCC;
--color-text-muted:     #5C5280;
```

### Typographie

```
Display : Bricolage Grotesque (400 / 600 / 800)  — titres, hero
Body    : DM Sans (400 / 500 / 600)              — corps, UI
Mono    : JetBrains Mono (400 / 500)             — code, données
```

### Conventions UI

- Thème : **dark** uniquement pour le MVP
- Radius : `12px` cartes, `8px` éléments inline
- Glassmorphisme : `backdrop-filter: blur(12px)` + `background: rgba(255,255,255,0.04)`
- Transitions : `all 0.2s ease` systématiquement sur les hover
- Animations Framer Motion : spring `stiffness: 300, damping: 30`
- Aucune couleur hardcodée — toujours via CSS variables ou `design-tokens.ts`

### Espacement

```
4px   gaps internes (icône + label)
8px   padding small (badge, chip)
12px  padding medium (bouton, tag)
16px  padding default (input, card)
24px  padding large (section header)
40px  padding section
```

---

## Structure Monorepo

```
ai-edu/
├── apps/
│   ├── web/
│   │   ├── app/
│   │   │   ├── (auth)/         login, register, consent
│   │   │   ├── (app)/          dashboard, modules/[moduleId], sandbox, custom-course, profile
│   │   │   ├── globals.css
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             shadcn/ui
│   │   │   ├── home/           Navbar, HeroSection, ModulesSection, StatsSection, CTASection
│   │   │   ├── gamification/   XPBar, StreakBadge, LevelCard
│   │   │   ├── course/         CourseCard, LessonBlock, QuizWidget, FillBlank, StoryBlock
│   │   │   └── layout/         AppSidebar, AppNavbar, ProgressHeader
│   │   └── lib/
│   │       └── design-tokens.ts
│   └── api/
│       └── src/
│           ├── core/           guards, interceptors, pipes, module-registry
│           ├── modules/        auth, users, courses, prompting, sandbox, custom-course, progress, audit
│           └── shared/
│               ├── ai/         MistralProvider, AI_PROVIDER token
│               ├── database/   TypeORM config + migrations
│               └── redis/
├── packages/
│   ├── shared/                 types TypeScript partagés, interface LearningModule
│   ├── ui/                     design system interne
│   └── config/                 eslint, tsconfig, tailwind partagés
└── turbo.json
```

---

## Base de données — Entités clés

- `users` : id, email, role, age_group, birth_year, consent_given, consent_date, parental_consent
- `courses` : id, module_id, title, level, tier, content_blocks (JSONB), xp_reward, is_published
- `user_progress` : user_id, course_id, status, score, xp_earned, streak_count, last_activity
- `quiz_attempts` : id, user_id, exercise_id, answer, is_correct, xp_earned, feedback
- `sandbox_sessions` : id, user_id, messages (JSONB chiffré AES-256), expires_at (TTL 30j)
- `generated_courses` : id, user_id, interests (JSONB anonymisé), content (JSONB)
- `audit_logs` : id, user_id, action, resource, ip_hash (SHA-256), created_at ← **obligatoire CNIL**

---

## Commandes

```bash
bash scripts/setup-local.sh  # setup initial (Docker + migrations + pnpm install)
pnpm dev                      # web + api en parallèle
pnpm dev --filter=web         # frontend seul
pnpm dev --filter=api         # backend seul
docker compose up -d          # PostgreSQL + Redis
pnpm --filter api run db:migrate  # appliquer les migrations SQL (runner généralisé)
pnpm lint
pnpm typecheck
pnpm test
```

### Variables d'environnement (clés)

| Variable | Usage |
|----------|-------|
| `AUTH_SECRET` | Secret NextAuth v5 (remplace `NEXTAUTH_SECRET`) |
| `AUTH_URL` | URL publique Next.js (remplace `NEXTAUTH_URL`) |
| `AUTH_GOOGLE_ID` | Client ID Google OAuth |
| `AUTH_GOOGLE_SECRET` | Client Secret Google OAuth |
| `AUTH_OAUTH_SECRET` | Secret serveur-à-serveur pour `POST /auth/oauth` |
| `DATABASE_URL` | PostgreSQL — port **5433** en dev local |
| `REDIS_URL` | Redis — port **6380** en dev local |
| `API_URL` | URL interne API (SSR → `http://localhost:3001`) |
| `NEXT_PUBLIC_API_URL` | URL API côté client |
| `MISTRAL_API_KEY` | Clé API Mistral AI (services NestJS + route handlers Next.js) |
| `MISTRAL_MODEL` | Modèle Mistral (`mistral-small-latest`) |

> Le rôle `admin` n'est **pas** exposé dans l'UI mais reste en BDD pour usage interne. Ne jamais le proposer à l'inscription.

---

## Checklist PR

- [ ] TypeScript strict — zéro `any`
- [ ] Tests unitaires pour tout nouveau service NestJS
- [ ] Zéro PII dans les logs ou prompts LLM
- [ ] `// CNIL:` sur toute ligne sensible
- [ ] Couleurs via variables CSS uniquement
- [ ] `pnpm lint && pnpm typecheck` passent
