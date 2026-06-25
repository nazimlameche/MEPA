# Prompt 05 — Audit + Fix : Validation automatique atelier de prompting & Suppression champ niveau cours sur mesure

> **Objectif** : Deux problèmes distincts à régler. Pour chaque problème : lire les fichiers concernés, diagnostiquer, puis appliquer le fix dans la même session.  
> **Prérequis** : L'audit P1–P4 (prompt-03) a été réalisé. Ce prompt s'appuie sur ses résultats connus.

---

## Contexte du projet

**AI-Edu** — Next.js 15 App Router + NestJS + TypeScript strict + TypeORM + PostgreSQL + NextAuth v5 + Zod.

**Ce qu'on sait déjà de l'audit précédent :**
- L'atelier de prompting est dans `apps/web/app/(app)/modules/prompting/`
- Le scoring passe par `apps/web/app/api/prompting/score/route.ts` (route handler Next.js)
- La persistance des tentatives passe par `POST /api/prompting/attempts` (NestJS)
- La page liste `/modules/prompting/page.tsx` charge `completed` et `bestScore` **depuis le mock** (`mockExercises`), pas depuis la BDD → la validation ne se reflète pas après un succès
- Le cours sur mesure est dans `apps/web/app/(app)/modules/custom-course/`, création dans `new/page.tsx`
- Le profil utilisateur est géré par NextAuth v5 + entité User en BDD (niveau collecté à l'inscription)

---

## PROBLÈME 1 — Validation de l'exercice de prompting non persistée

**Symptôme** : L'utilisateur atteint le score requis (passed = true), voit le feedback de succès, mais en retournant sur la liste des exercices, l'exercice n'est pas marqué "complété".

---

### Étape 1A — Auditer le backend : endpoint `/api/prompting/attempts`

Lis les fichiers suivants en entier :

- `apps/api/src/modules/prompting/prompting.controller.ts` (ou équivalent — cherche le controller qui gère la route `POST /prompting/attempts`)
- `apps/api/src/modules/prompting/prompting.service.ts`
- L'entité TypeORM associée aux attempts (cherche `PromptingAttempt`, `attempt`, `exercise_attempt` dans les noms de fichiers)

Pour chaque fichier, note :
1. **Le handler POST** : que fait-il exactement ? Sauvegarde-t-il en BDD ? Retourne-t-il quelque chose ?
2. **L'entité** : quelles colonnes ? Y a-t-il un champ `completed`, `passed`, `bestScore` ?
3. **La relation User ↔ Attempt** : est-elle présente (userId en colonne ou FK) ?
4. **Y a-t-il un endpoint GET** pour récupérer les attempts d'un utilisateur ? Si oui, reproduis la route et la méthode de service.

---

### Étape 1B — Auditer le frontend : page liste des exercices

Lis en entier :

- `apps/web/app/(app)/modules/prompting/page.tsx`

Note :
1. **Source des données** : les exercices viennent-ils uniquement de `mockExercises` ? Y a-t-il un appel API ou Server Action pour enrichir avec les données BDD ?
2. **Champs `completed` et `bestScore`** : d'où viennent-ils (mock, fetch, Server Component avec DB query) ?
3. **Le composant est-il un Server Component ou Client Component** (`'use client'` présent ?) ?
4. **Y a-t-il un `revalidatePath('/modules/prompting')` quelque part** après une tentative réussie ?

---

### Étape 1C — Auditer le frontend : composant PromptingExercise

Lis `apps/web/components/prompting/PromptingExercise.tsx`.

Note précisément :
1. **Que se passe-t-il après `passed = true`** ? Dans quel ordre : appel à `/api/prompting/attempts` → revalidation → navigation ?
2. **Y a-t-il un `router.refresh()` ou `revalidatePath` déclenché côté client après le succès ?**
3. **Le corps du POST vers `/api/prompting/attempts`** : quels champs sont envoyés exactement (exerciseId, score, passed, userPrompt…) ?
4. **En cas de passed = true, y a-t-il une Server Action intermédiaire** qui déclenche une revalidation, ou l'appel est-il fait directement depuis le client vers NestJS ?

---

### Fix 1 — À appliquer selon ce que tu trouves

**Cas A — Le backend sauvegarde en BDD mais la page liste ne lit pas la BDD :**

Dans `apps/web/app/(app)/modules/prompting/page.tsx` :

1. Récupère l'utilisateur via `auth()` (NextAuth v5) ou l'équivalent Server Component.
2. Ajoute un appel API vers NestJS pour récupérer les attempts de l'utilisateur :
   ```ts
   const attempts = await apiClient.get(`/prompting/attempts?userId=${session.user.id}`);
   // ou via le endpoint existant — adapte selon ce que tu trouves en 1A
   ```
3. Dans la liste des exercices, remplace la valeur mock de `completed` et `bestScore` par les données BDD :
   ```ts
   const exercisesWithProgress = mockExercises.map(ex => {
     const attempt = attempts.find(a => a.exerciseId === ex.id);
     return {
       ...ex,
       completed: attempt?.passed ?? false,
       bestScore: attempt?.score ?? 0,
     };
   });
   ```
4. Si la page n'a pas de `revalidatePath` déclenché après un succès, ajoute une **Server Action** dans un nouveau fichier `apps/web/app/actions/revalidate-prompting.ts` :
   ```ts
   'use server';
   import { revalidatePath } from 'next/cache';
   export async function revalidatePrompting() {
     revalidatePath('/modules/prompting');
   }
   ```
   Appelle cette Server Action dans `PromptingExercise.tsx` immédiatement après le POST à `/api/prompting/attempts` quand `data.passed === true`.

**Cas B — Le backend ne sauvegarde pas ou ne reçoit pas correctement :**

Lis le handler POST de `prompting.controller.ts`. Si le champ `passed` n'est pas sauvegardé en BDD, ajoute-le à l'entité et au service. Utilise un upsert sur `(userId, exerciseId)` pour ne garder que le meilleur score :
```ts
// Dans le service
await this.attemptRepo.upsert(
  { userId, exerciseId, score, passed },
  { conflictPaths: ['userId', 'exerciseId'], skipUpdateIfNoValuesChanged: false }
);
```

**Dans tous les cas :**

Dans `PromptingExercise.tsx`, assure-toi que le POST vers `/api/prompting/attempts` est appelé **uniquement quand `data.passed === true`** (ne pas persister les tentatives échouées si ce n'est pas déjà le cas, ou gérer les deux cas séparément selon la logique existante).

---

## PROBLÈME 2 — Demande redondante du niveau dans le cours sur mesure

**Symptôme** : Lors de la création d'un cours sur mesure, l'utilisateur se voit demander son niveau scolaire — alors que cette information est déjà collectée à l'inscription et stockée dans son profil.

---

### Étape 2A — Auditer le profil utilisateur

Lis les fichiers suivants :

- `apps/api/src/modules/users/user.entity.ts` (ou équivalent — cherche l'entité TypeORM User)
- `apps/web/lib/auth.ts` (configuration NextAuth) — déjà partiellement audité, mais note spécifiquement les champs exposés dans le token/session JWT

Note :
1. **Le champ niveau** : quel est son nom exact dans l'entité User (`level`, `grade`, `schoolLevel`, `niveauScolaire`…) ?
2. **Est-il exposé dans le token JWT / la session NextAuth** ? Si oui, sous quel nom (`session.user.level` ?) ?
3. **Si non exposé dans la session** : est-il accessible via un endpoint `GET /users/me` ou équivalent ?

---

### Étape 2B — Auditer le flow de création de cours sur mesure

Lis en entier :

- `apps/web/app/(app)/modules/custom-course/new/page.tsx`
- Tout composant importé dans ce fichier qui gère les étapes de création (cherche `Step`, `Form`, `Wizard`, `Creation`, `New` dans les noms de fichiers sous `apps/web/components/custom-course/`)

Note :
1. **Le champ "niveau"** : à quelle étape est-il demandé ? Quel composant le rend (input, select, boutons radio) ?
2. **Comment il est transmis** : est-il envoyé dans le body du POST de création, dans l'URL, dans un état local ?
3. **L'endpoint de création** : quel est le body exact envoyé à NestJS pour créer un parcours ? Inclut-il `level` ?
4. **Y a-t-il d'autres étapes dans le wizard** que la sélection du niveau + la sélection du thème ?

---

### Fix 2 — À appliquer selon ce que tu trouves

**Objectif** : supprimer le champ niveau de l'UI de création, et lire automatiquement le niveau depuis le profil de l'utilisateur connecté.

#### 2.1 — Récupérer le niveau depuis la session/profil

Dans `apps/web/app/(app)/modules/custom-course/new/page.tsx` (Server Component) :

```ts
import { auth } from '@/lib/auth';

const session = await auth();
const userLevel = session?.user?.level; // adapte le nom de champ selon ce que tu trouves en 2A
```

Si le niveau n'est **pas dans la session JWT**, ajoute un appel à `GET /users/me` :
```ts
const me = await apiClient.get('/users/me', { headers: { Authorization: `Bearer ${session.accessToken}` } });
const userLevel = me.level; // adapte
```

Si le niveau n'est **pas exposé dans la session JWT mais devrait l'être**, ajoute-le dans `apps/web/lib/auth.ts` dans le callback `jwt` et `session` :
```ts
// callback jwt
token.level = user.level ?? token.level;

// callback session
session.user.level = token.level;
```
Et dans le type augmenté TypeScript (cherche `next-auth.d.ts` ou `types/next-auth.d.ts`) ajoute :
```ts
interface User { level?: string; }
interface Session { user: { level?: string } }
```

#### 2.2 — Supprimer le champ niveau de l'UI

Dans le composant de création (trouvé en 2B) :

1. **Supprime** le rendu du champ de sélection du niveau (le composant input/select/radio correspondant).
2. **Supprime** l'étape du wizard dédiée au niveau si elle était isolée.
3. Si le wizard a un état local pour le niveau (`const [level, setLevel] = useState(...)`), remplace-le par la valeur récupérée en 2.1 passée en prop depuis le Server Component.

#### 2.3 — Passer le niveau au corps de la requête de création

Dans le composant ou la Server Action qui envoie le POST de création vers NestJS, assure-toi que `level: userLevel` est bien inclus dans le body, en utilisant la valeur du profil et non plus la valeur saisie par l'utilisateur.

#### 2.4 — Vérification backend

Lis `apps/api/src/modules/custom-course/custom-course.controller.ts` et `custom-course.service.ts`.

Vérifie que le champ `level` dans le DTO de création est bien utilisé pour personnaliser le prompt Mistral (`buildChapterPrompt`). Si le niveau venait jusqu'ici de la saisie utilisateur et que le code fonctionne, aucun changement backend n'est nécessaire — seule la source (UI → profil) change.

---

## Rapport attendu

```
## Problème 1 — Validation atelier de prompting

### Diagnostic
- Cas identifié : A / B / autre
- [Description de ce qui bloque la persistence ou l'affichage]

### Fix appliqué
- [Fichiers modifiés avec numéros de ligne]

## Problème 2 — Niveau cours sur mesure

### Diagnostic
- Nom du champ niveau dans l'entité User : [...]
- Le niveau est-il dans la session JWT : oui / non
- Étape du wizard où le champ était affiché : [...]

### Fix appliqué
- [Fichiers modifiés avec numéros de ligne]

## Anomalies supplémentaires observées
[Si des dettes ou bugs sont rencontrés pendant la lecture]
```

---

## Règles non-négociables

- TypeScript strict — pas de `any` introduit
- Zod pour tout parsing de réponse API si absent
- Si un fichier n'existe pas à l'emplacement supposé, dis-le et cherche l'équivalent réel
- Cite les numéros de ligne pour chaque modification
