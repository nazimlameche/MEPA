# Prompt 04 — Corrections : Parcours théorique → Cours sur mesure, Markdown, Narration, Atelier de prompting

> **Prérequis** : L'audit (prompt-03) a été exécuté. Ce prompt s'appuie sur ses résultats.  
> **Objectif** : Appliquer toutes les corrections identifiées. Fichiers et lignes exactes fournis — pas besoin de re-chercher.

---

## Contexte du projet

**AI-Edu** — plateforme gamifiée Next.js 15 + NestJS + TypeScript strict + Tailwind CSS v4 + Framer Motion + shadcn/ui.

**Décision produit** : Le parcours théorique (M1, route `/modules/theory`) est supprimé. Le cours sur mesure (M4, route `/modules/custom-course`) le remplace partout dans la plateforme.

---

## BLOC 1 — Suppression du parcours théorique

> Règle : ne pas supprimer les fichiers physiques des pages `/modules/theory/` — les laisser en place mais déconnecter toute référence entrante. On fera le ménage de dossiers dans un second temps.

### 1.1 — Navigation (4 fichiers)

**`apps/web/components/layout/AppSidebar.tsx` — ligne 11**

Remplace :
```ts
{ href: '/modules/theory', icon: BookOpen, label: 'Parcours' }
```
Par :
```ts
{ href: '/modules/custom-course', icon: BookOpen, label: 'Cours sur mesure' }
```

**`apps/web/components/layout/AppNavbar.tsx` — ligne 12**

Remplace :
```ts
{ href: '/modules/theory', icon: BookOpen, label: 'Parcours' }
```
Par :
```ts
{ href: '/modules/custom-course', icon: BookOpen, label: 'Cours sur mesure' }
```

**`apps/web/components/layout/Sidebar.tsx` — ligne 11**

Remplace :
```ts
{ label: 'Parcours Théorique', href: '/modules/theory', icon: BookOpen }
```
Par :
```ts
{ label: 'Cours sur mesure', href: '/modules/custom-course', icon: BookOpen }
```

**`apps/web/components/layout/Navbar.tsx` — ligne 22**

Remplace :
```ts
{ label: 'Théorie', href: '/modules/theory' }
```
Par :
```ts
{ label: 'Cours sur mesure', href: '/modules/custom-course' }
```

---

### 1.2 — CourseReader (liens retour)

**`apps/web/components/course/CourseReader.tsx` — ligne 157**

Remplace :
```tsx
<Link href="/modules/theory">Retour au parcours</Link>
```
Par :
```tsx
<Link href="/modules/custom-course">Retour au cours</Link>
```

**`apps/web/components/course/CourseReader.tsx` — ligne 177**

Remplace :
```tsx
<Link href="/modules/theory"><ArrowLeft /> Parcours</Link>
```
Par :
```tsx
<Link href="/modules/custom-course"><ArrowLeft /> Cours sur mesure</Link>
```

---

### 1.3 — Revalidation

**`apps/web/app/actions/revalidate.ts` — ligne 8**

Remplace :
```ts
revalidatePath('/modules/theory'); // LearningPath — statut completed des leçons
```
Par :
```ts
revalidatePath('/modules/custom-course'); // Cours sur mesure — statut completed des chapitres
```

---

### 1.4 — Mock data et dashboard

**`apps/web/lib/mock/dashboard-data.ts` — lignes 16–22**

Trouve l'entrée `{ id: 'theory', ... }` dans `mockModules[]` et remplace-la par :
```ts
{ id: 'custom-course', title: 'Cours sur mesure', route: '/modules/custom-course', available: true }
```

**`apps/web/app/(app)/dashboard/page.tsx` — ligne 3**

Si l'import `mockCourseList` vient de `@/lib/mock/theory-data`, remplace-le par l'import équivalent provenant des données du cours sur mesure. Si aucun équivalent n'existe encore, remplace par un tableau vide `[]` avec un commentaire `// TODO: brancher sur les données custom-course BDD`.

---

### 1.5 — Page liste des modules

**`apps/web/app/(app)/modules/page.tsx`**

Lis ce fichier. Trouve toute utilisation de `mockModules` ou équivalent qui inclut l'entrée `theory`. Assure-toi que l'entrée `theory` n'est plus listée après la modification de `dashboard-data.ts`. Si `mockModules` est défini localement dans ce fichier, supprime l'entrée `theory` et ajoute `custom-course` si elle n'y est pas.

---

### 1.6 — Logique de progression (dette critique #3)

**`apps/web/lib/progress/derive.ts`**

Ce fichier calcule le taux de complétion du dashboard sur `TOTAL_THEORY_COURSES = 6`. Après suppression de theory, laisser ce chiffre causerait un calcul de progression erroné.

Applique les modifications suivantes :

1. **Ligne 6** : remplace le commentaire `// Total courses across all modules (theory + prompting)` par `// Total courses across all modules (custom-course chapters + prompting)`.

2. **Ligne 8** : renomme `TOTAL_THEORY_COURSES` → `TOTAL_CUSTOM_COURSE_CHAPTERS` et garde la valeur `6` (les 6 chapitres du cours sur mesure restent 6).

3. **Ligne 10** : adapte en conséquence :
   ```ts
   export const TOTAL_CATALOGUE_COURSES = TOTAL_CUSTOM_COURSE_CHAPTERS + TOTAL_PROMPTING_COURSES;
   ```

4. **Lignes 55–73** : Partout où `TOTAL_THEORY_COURSES` est référencé, remplace par `TOTAL_CUSTOM_COURSE_CHAPTERS`. Partout où `mod.id === 'theory'` est testé, remplace par `mod.id === 'custom-course'`. Si la logique de `theoryCompleted` lis des données mock théorie, remplace la source par l'équivalent custom-course (liste des chapitres complétés de l'utilisateur en BDD) — ou laisse un `// TODO` explicite si la donnée n'est pas encore disponible.

5. **Ligne 109** : si le lien généré pointe vers `` `/modules/theory/${item.courseId}` ``, remplace par `` `/modules/custom-course/${item.courseId}` ``.

---

### 1.7 — Tests backend

**`apps/api/src/core/module-registry/module-registry.service.spec.ts` — lignes 22, 24, 35**

Remplace chaque occurrence de `'theory'` (comme catégorie de module) par `'custom-course'`. Assure-toi que les tests compilent encore après modification.

---

## BLOC 2 — Rendu markdown dans le cours sur mesure

### 2.1 — Contraindre le prompt Mistral au texte brut

**`apps/web/app/api/custom-course/chapters/[chapterId]/generate/route.ts` — lignes 96–125**

Dans la fonction `buildChapterPrompt`, trouve la section qui décrit les blocs disponibles. Dans la description du bloc `text` et du bloc `story`, ajoute les contraintes suivantes :

Pour le bloc `text` (champ `content`) :
```
IMPORTANT — Le champ "content" doit être du texte brut uniquement.
N'utilise JAMAIS de syntaxe markdown dans ce champ :
- Pas de # ou ## pour les titres
- Pas de ** pour le gras
- Pas de _ pour l'italique
- Pas de - ou * pour les listes
- Pas de > pour les citations
- Pas de backticks pour le code
Utilise uniquement des paragraphes séparés par des sauts de ligne. Le rendu est géré par l'interface.
```

Pour le bloc `story` (champs `narrative` et `moral`) : même contrainte, même formulation.

### 2.2 — Enrichir le rendu TextBlock pour les cas résiduels

**`apps/web/components/course/TextBlock.tsx` — fonction `renderText` (lignes 3–16)**

Ajoute les remplacements suivants dans la chaîne `.replace()`, **avant** le `.replace(/\n/g, '<br />')` :

```ts
// Titres markdown résiduels
.replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-4 mb-1">$1</h3>')
.replace(/^## (.+)$/gm, '<h2 class="text-lg font-semibold mt-5 mb-2">$1</h2>')
.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-6 mb-2">$1</h1>')
// Italique
.replace(/\*(.*?)\*/g, '<em>$1</em>')
// Listes à puce résiduelles
.replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
// Citations
.replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-gray-300 pl-3 italic text-gray-500">$1</blockquote>')
```

> Note : ces remplacements sont des garde-fous pour le texte généré avant la contrainte 2.1 ou si Mistral dépasse les consignes. Ils ne remplacent pas la contrainte de prompt.

---

## BLOC 3 — Profondeur narrative des histoires

**`apps/web/app/api/custom-course/chapters/[chapterId]/generate/route.ts`**

Localise `CHAPTER_IA_DIRECTIVES` (lignes 51–68) et la section du prompt qui définit le bloc `story`.

### 3.1 — Enrichir la contrainte narrative du bloc story

Dans le prompt Mistral, remplace ou complète la description actuelle du bloc `story` par :

```
Bloc "story" — CONTRAINTES NARRATIVES OBLIGATOIRES :
Le bloc story doit raconter une scène de vie réelle avec un arc narratif en 4 temps :
1. SITUATION : décris le contexte précis dans lequel se trouve le personnage (lieu, moment, action en cours)
2. DÉCLENCHEUR : montre l'événement ou la question concrète qui amène le personnage à réfléchir
3. RÉFLEXION : montre les étapes de pensée du personnage — ce qu'il/elle observe, ce qui l'étonne, ce qu'il/elle teste
4. CONSTAT : formule la conclusion à laquelle il/elle arrive, en lien direct avec les étapes précédentes

Interdit : écrire directement "X se rend compte que..." sans avoir d'abord montré le déclencheur et la réflexion.
Longueur minimale du champ "narrative" : 120 mots.
Exemple de MAUVAISE narrative : "Léa se rend compte que l'IA n'a pas d'émotions."
Exemple de BONNE narrative : "Léa demande à l'IA si elle est heureuse d'avoir bien répondu. L'IA lui répond avec enthousiasme. Léa repose la même question en changeant un mot. La réponse change complètement. Léa essaie encore, et encore. Elle comprend que l'IA adapte ses mots au contexte, mais qu'aucune réponse ne vient d'un ressenti réel — juste d'un calcul de probabilité."
```

---

## BLOC 4 — Atelier de prompting

### 4.1 — Fix bug : score 33 systématique (cause : placeholders mal formés)

**`apps/web/app/api/prompting/score/route.ts` — lignes 13–55**

Le template JSON inline dans le prompt contient des placeholders de type `<0 à 33>` que Mistral interprète comme des valeurs littérales. Remplace le template par un exemple concret avec des valeurs numériques réelles.

Remplace le template JSON actuel par ceci (adapte les noms de champs si différents) :

```json
{
  "structure": {
    "score": 22,
    "feedback": "L'objectif est mentionné mais le contexte manque. Préciser pour qui et dans quel but."
  },
  "pii_check": {
    "score": 33,
    "pii_found": [],
    "feedback": "Aucune donnée personnelle détectée."
  },
  "output_format": {
    "score": 15,
    "feedback": "Aucun format de sortie précisé. Demander une liste, un tableau, un paragraphe ?"
  },
  "total_score": 70,
  "global_feedback": "Bon début ! Précise le contexte et le format attendu pour un meilleur score.",
  "passed": false
}
```

**Dans la même fonction**, remplace l'instruction `passed = true UNIQUEMENT si total_score === 100` par :
```
"passed": true si total_score >= 90, false sinon
```

### 4.2 — Enrichir le barème (catégories et sous-catégories)

**`apps/web/app/api/prompting/score/route.ts` — section critères (lignes 13–55)**

Remplace les 3 critères actuels par un barème à 4 critères avec sous-catégories. Adapte le schéma JSON en conséquence :

**Nouveau barème (total = 100) :**

```
critère 1 — clarté_objectif (0–25 points)
  - L'objectif principal est exprimé clairement dès le début
  - La demande est sans ambiguïté (on sait exactement ce qui est attendu)
  Sous-score :
    - objectif_explicite : 0, 10 ou 15 (absent / vague / clair)
    - sans_ambiguïté : 0 ou 10 (ambigu / précis)

critère 2 — contexte (0–25 points)
  - Un rôle ou une situation est donnée à l'IA
  - Le public cible ou l'usage est mentionné
  Sous-score :
    - rôle_donné : 0 ou 12 (absent / présent)
    - public_cible : 0 ou 13 (absent / présent)

critère 3 — format_sortie (0–25 points)
  - Le type de réponse est précisé (liste, tableau, texte court, étapes...)
  - La longueur ou la langue est indiquée si pertinent
  Sous-score :
    - type_réponse : 0 ou 15 (absent / présent)
    - longueur_langue : 0 ou 10 (absent / présent)

critère 4 — sécurité_données (0–25 points)
  Toujours 25/25 SAUF si le prompt contient :
  - Un prénom + âge identifiable → -15
  - Un numéro de téléphone ou email → score = 0 (disqualifiant)
  - Un nom de famille → -10
```

Le JSON retourné par Mistral doit suivre ce schéma :
```json
{
  "clarté_objectif": { "score": 20, "feedback": "..." },
  "contexte": { "score": 12, "feedback": "..." },
  "format_sortie": { "score": 10, "feedback": "..." },
  "sécurité_données": { "score": 25, "pii_found": [], "feedback": "..." },
  "total_score": 67,
  "global_feedback": "...",
  "passed": false
}
```

Mets à jour la validation côté route handler pour parser ce nouveau schéma. Utilise **Zod** pour la validation (dette #7 de l'audit — parsing manuel actuel est fragile).

### 4.3 — Fix bug : message d'erreur incorrect

**`apps/web/app/api/prompting/score/route.ts` — prompt d'évaluation**

Le message `"recommence en structurant ta demande"` vient du champ `global_feedback` retourné par Mistral, pas du frontend. Il s'affiche dans tous les cas de score bas parce que le prompt actuel n'impose aucune contrainte sur le contenu de `global_feedback`.

Ajoute l'instruction suivante dans le prompt Mistral :

```
Le champ "global_feedback" doit :
- Être formulé comme un conseil positif et personnalisé (max 2 phrases)
- Identifier la principale force du prompt (toujours)
- Suggérer UNE amélioration concrète et spécifique
- NE PAS utiliser de phrases génériques comme "recommence en structurant ta demande" ou "essaie d'être plus clair"
- Utiliser "tu" et être bienveillant — l'utilisateur est un collégien/lycéen
```

### 4.4 — Fix coloration du score central

**`apps/web/components/prompting/ScoreDisplay.tsx` — ligne 68**

Remplace :
```ts
color: passed ? 'var(--color-complete)' : 'var(--color-ink)'
```
Par :
```ts
color: total_score >= 90 ? 'var(--color-complete)' : total_score >= 50 ? 'var(--color-streak)' : 'var(--color-error)'
```

> Cohérence : le trait SVG de l'anneau est déjà conditionnel correctement (ligne 57). Aligne le chiffre sur la même logique, indépendamment de `passed`.

De la même façon, vérifie si le trait SVG de l'anneau utilise encore `passed` comme première condition :
```ts
stroke={passed ? 'var(--color-complete)' : total_score >= 50 ? 'var(--color-streak)' : 'var(--color-error)'}
```
Si oui, remplace `passed` par `total_score >= 90` pour cohérence avec le nouveau seuil.

### 4.5 — Fix seuil de validation

Le seuil de 100 est déjà traité dans 4.1 (prompt Mistral). Vérifie aussi côté frontend :

**`apps/web/components/prompting/PromptingExercise.tsx`**

Lis le fichier. Si `state === 'perfect'` est conditionné autrement que sur `data.passed` (ex : `data.total_score === 100`), remplace cette condition par `data.passed` pour que le seuil reste centralisé dans le prompt Mistral (source unique de vérité).

Si le POST vers `/api/prompting/attempts` envoie `passed: true/false`, vérifier que c'est bien `data.passed` qui est transmis, pas un calcul local.

---

## BLOC 5 — Dettes critiques à traiter

### 5.1 — Validation Zod dans score/route.ts (dette #7)

Le parsing actuel (lignes 104–110) est manuel et fragile. Après la refonte du schéma en 4.2, wrape le JSON.parse dans un schéma Zod. Exemple de schéma à créer :

```ts
import { z } from 'zod';

const ScoreResponseSchema = z.object({
  clarté_objectif: z.object({ score: z.number().min(0).max(25), feedback: z.string() }),
  contexte: z.object({ score: z.number().min(0).max(25), feedback: z.string() }),
  format_sortie: z.object({ score: z.number().min(0).max(25), feedback: z.string() }),
  sécurité_données: z.object({ score: z.number().min(0).max(25), pii_found: z.array(z.string()), feedback: z.string() }),
  total_score: z.number().min(0).max(100),
  global_feedback: z.string(),
  passed: z.boolean(),
});
```

En cas d'échec de parsing, retourne une erreur 500 explicite côté client avec un message générique (ne pas exposer l'erreur Zod brute).

### 5.2 — revalidate.ts (dette #2)

**`apps/web/app/actions/revalidate.ts`**

Si `revalidatePath('/modules/theory')` existe toujours après le bloc 1.3, supprime cette ligne. Elle ne cause pas d'erreur mais est une revalidation morte qui rallonge inutilement les Server Actions.

---

## Ordre d'exécution recommandé

1. Bloc 1 (navigation + revalidation + mock data + derive.ts + tests) — compile + vérifie que `/modules/theory` n'est plus accessible depuis la navigation
2. Bloc 4.1 → 4.5 (atelier de prompting — bugs prioritaires)
3. Bloc 2 (rendu markdown — prompt + TextBlock)
4. Bloc 3 (narration — prompt uniquement)
5. Bloc 5 (dettes)

---

## Règles non-négociables

- TypeScript strict — pas de `any` introduit
- Zod pour tout parsing Mistral (règle CLAUDE.md)
- Cite les fichiers et lignes modifiés dans ton résumé final
- Si un fichier a changé depuis l'audit et que le contenu diffère, documente l'écart et adapte
- Ne modifie pas les fichiers sous `apps/web/app/(app)/modules/theory/` — les laisser orphelins pour l'instant
