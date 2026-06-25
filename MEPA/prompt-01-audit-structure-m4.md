# Prompt 01 — Audit de la structure du module M4 (Cours Sur-Mesure)

> **Usage** : Coller ce prompt dans Claude Code avant toute intervention sur le module M4.  
> **Objectif** : Établir la vérité terrain de l'implémentation actuelle avant de toucher quoi que ce soit.

---

## Contexte du projet

Tu travailles sur **AI-Edu**, une plateforme d'apprentissage gamifiée (style Duolingo) pour enseigner l'IA à des collégiens/lycéens, développée en collaboration avec la CNIL.

**Stack :** Turborepo monorepo · Next.js 15 App Router · NestJS · TypeScript strict · TypeORM + PostgreSQL (port 5433) · Redis (port 6380) · NextAuth v5 · Mistral AI (`mistral-small-latest`) · Tailwind CSS v4 · shadcn/ui · Framer Motion · Sonner

**Module concerné : M4 — Cours Sur-Mesure**  
L'utilisateur choisit un thème (ex : football, musique), le système génère 6 chapitres pédagogiques fixes avec contenu personnalisé via Mistral. Chaque utilisateur peut avoir plusieurs parcours. TTL 90 jours. Génération lazy (au premier clic sur un chapitre).

---

## Mission

Fais un audit exhaustif et factuel de l'état actuel du module M4. **Ne modifie rien.** Lis, liste, documente.

---

## Étapes

### Étape 1 — Cartographie frontend

Liste récursivement tous les fichiers dans :
- `apps/web/app/(app)/modules/custom-course/`
- `apps/web/components/` (cherche tous les fichiers dont le nom contient `custom`, `course`, `sur-mesure`, `parcours`, `theme`, `chapter`)

Pour chaque fichier trouvé, note :
- Le chemin complet
- Le type (page, composant, hook, layout, loading, error)
- En une ligne : ce qu'il fait

### Étape 2 — Cartographie backend

Liste récursivement tous les fichiers dans :
- `apps/api/src/modules/custom-course/`

Pour chaque fichier, note :
- Le chemin complet
- Le type (controller, service, entity, dto, module)
- Les endpoints exposés (méthode HTTP + route)

### Étape 3 — Lire les fichiers critiques

Lis et reproduis le contenu complet de chaque fichier ci-dessous (adapte les chemins si la structure réelle diffère) :

**Frontend :**
- La page principale du dashboard M4 (probablement `apps/web/app/(app)/modules/custom-course/page.tsx`)
- La page de création de parcours (probablement `apps/web/app/(app)/modules/custom-course/new/page.tsx`)
- La page d'un parcours spécifique (probablement `apps/web/app/(app)/modules/custom-course/[id]/page.tsx`)
- Tout composant modal de changement de thème ou de suppression (cherche `delete`, `change-theme`, `confirm`, `dialog` dans les noms)
- Le fichier `loading.tsx` s'il existe dans ces routes

**Backend :**
- Le controller M4
- Le service M4
- L'entité `generated_courses` (TypeORM)

**Route handlers Next.js :**
- Cherche dans `apps/web/app/api/` tout handler lié à `custom-course`, `generate`, `theme`

### Étape 4 — Analyser les appels API

Dans tous les fichiers frontend lus en étape 3 :
1. Liste chaque appel `fetch` / `axios` / Server Action / `router.push` / `router.refresh` / `revalidatePath` / `revalidateTag`
2. Note l'URL cible, la méthode HTTP, et si c'est fait côté client ou serveur

### Étape 5 — Analyser la gestion d'état

Dans les composants frontend lus :
1. Liste tous les `useState`, `useReducer`, `useOptimistic` présents
2. Note si des mutations UI sont faites **avant** la réponse serveur (optimistic updates) ou **après**
3. Liste tous les `useTransition` / `startTransition` présents

### Étape 6 — Analyser le flow de déconnexion

Lis les fichiers suivants et reproduis leur contenu :
- `apps/web/lib/auth.ts` ou équivalent (configuration NextAuth)
- Tout composant contenant `signOut` (cherche avec grep)
- Le handler `apps/web/app/api/auth/[...nextauth]/route.ts`

### Étape 7 — Vérifier les animations Framer Motion

Dans tous les fichiers frontend du module M4 :
1. Liste chaque import de `framer-motion`
2. Liste chaque composant `<motion.*>` avec ses props `initial`, `animate`, `exit`
3. Note si un `<AnimatePresence>` wrape les modales/dialogs

---

## Rapport attendu

Structure ta réponse ainsi :

```
## 1. Arborescence réelle M4
[liste des fichiers avec type et rôle]

## 2. Endpoints API M4
[liste méthode + route + description]

## 3. Entité generated_courses (TypeORM)
[colonnes et types]

## 4. Appels API depuis le frontend
[liste par fichier]

## 5. Gestion d'état
[useState / optimistic / transitions]

## 6. Flow de déconnexion
[description du flow avec les fichiers concernés]

## 7. Animations Framer Motion
[ce qui est animé, ce qui ne l'est pas]

## 8. Dettes techniques identifiées
[anomalies, incohérences, risques CNIL vus pendant l'audit]
```

---

## Règles non-négociables

- **Ne modifie aucun fichier**
- Si un fichier mentionné n'existe pas, dis-le explicitement — ne devine pas
- Si la structure diffère de ce qui est décrit dans le contexte, documente la réalité, pas la spec
- TypeScript strict : signale tout `any` rencontré
- Signale immédiatement toute violation CNIL potentielle visible dans le code lu
