# Prompt 03 — Audit : Suppression parcours théorique, rendu markdown, histoires, atelier de prompting

> **Usage** : Coller ce prompt dans Claude Code avant toute intervention.  
> **Objectif** : Cartographier l'état réel du code sur 4 périmètres avant de rédiger le prompt de corrections.  
> **Règle absolue : ne modifie aucun fichier.**

---

## Contexte du projet

**AI-Edu** — plateforme gamifiée d'apprentissage de l'IA pour collégiens/lycéens (partenariat CNIL).

**Stack :** Turborepo monorepo · Next.js 15 App Router · NestJS · TypeScript strict · TypeORM + PostgreSQL · Redis · NextAuth v5 · Mistral AI (`mistral-small-latest`) · Tailwind CSS v4 · shadcn/ui · Framer Motion · Sonner

**Décision produit ayant motivé cet audit :**
- Le **"parcours théorique"** est supprimé de la plateforme. Le **"cours sur mesure"** (M4) le remplace partout — dans la navigation, la hero page, le suivi de progression, et toute mention textuelle.
- Des bugs de **rendu markdown** ont été signalés dans le cours sur mesure (texte mal indenté, `**` non rendus, etc.).
- Des **problèmes de profondeur narrative** ont été signalés dans les histoires et parties de cours générées (manque de contexte sur comment les personnages arrivent à leurs constats).
- Des **bugs et axes d'amélioration** ont été identifiés dans l'atelier de prompting (message d'erreur incorrect, coloration du score absente, barème trop grossier, seuil de validation à 100%).

---

## PÉRIMÈTRE 1 — Parcours théorique : cartographier toutes les occurrences

### 1A — Cherche dans tout le frontend

Lance les commandes suivantes et reproduis leur output complet :

```bash
grep -r "parcours-theorique\|parcours_theorique\|ParcoursTheorique\|parcours théorique\|theoretical\|theorie\|théorie" \
  apps/web --include="*.tsx" --include="*.ts" --include="*.json" -l

grep -r "parcours-theorique\|parcours_theorique\|ParcoursTheorique\|parcours théorique\|theoretical\|theorie\|théorie" \
  apps/web --include="*.tsx" --include="*.ts" -n
```

Pour chaque occurrence trouvée, note :
- Le fichier complet concerné (chemin)
- Le numéro de ligne
- Le contexte (5 lignes autour)
- La nature de l'occurrence : route, label, lien, condition, composant, type TypeScript

### 1B — Cherche dans tout le backend

```bash
grep -r "parcours-theorique\|parcours_theorique\|ParcoursTheorique\|parcours théorique\|theoretical\|theorie\|théorie" \
  apps/api --include="*.ts" -n
```

### 1C — Cherche dans les fichiers de routing / navigation

Lis les fichiers suivants en entier et note toute référence au parcours théorique, tout lien de navigation, toute condition d'affichage, tout badge/unlock lié :

- `apps/web/app/(app)/layout.tsx`
- `apps/web/components/layout/AppSidebar.tsx` (ou équivalent sidebar/navbar)
- Tout fichier de configuration de navigation (cherche `nav`, `sidebar`, `menu`, `routes` dans les noms de fichiers sous `apps/web/`)
- `apps/web/app/(app)/page.tsx` (homepage / hero page de la plateforme)
- `apps/web/app/(app)/modules/page.tsx` (liste des modules si elle existe)

### 1D — Cherche dans le suivi de parcours / progression

Cherche les fichiers liés à la progression de l'utilisateur :

```bash
find apps/web -type f \( -name "*.tsx" -o -name "*.ts" \) | xargs grep -l "progression\|progress\|suivi\|completion\|parcours" 2>/dev/null
```

Lis les 3-5 fichiers les plus pertinents trouvés. Note comment le parcours théorique y est référencé (comme module, comme étape, comme condition de déblocage ?).

### 1E — Cartographie des modules

Lis `apps/web/app/(app)/modules/` récursivement. Liste toutes les routes et sous-dossiers. Identifie le dossier du parcours théorique et du cours sur mesure. Note leurs chemins exacts.

---

## PÉRIMÈTRE 2 — Rendu markdown dans le cours sur mesure

### 2A — Localiser le rendu du contenu généré

Lis les fichiers suivants en entier :

- `apps/web/app/(app)/modules/custom-course/[id]/[chapterId]/page.tsx` (ou l'équivalent exact — la page qui affiche le contenu d'un chapitre généré)
- Tout composant dont le nom contient `chapter`, `content`, `lesson`, `story`, `render`, `markdown` sous `apps/web/components/custom-course/`

Pour chaque fichier lu, note :
1. Comment le contenu textuel généré par Mistral est affiché — `dangerouslySetInnerHTML`, une librairie de rendu markdown (ex : `react-markdown`, `marked`, `remark`), ou du texte brut `{content}` ?
2. Y a-t-il un import de librairie de rendu markdown ? Si oui, laquelle et quelle version ?
3. Le contenu stocké en base est-il du markdown brut, du HTML, ou du JSON structuré ?

### 2B — Inspecter le prompt Mistral

Lis le service backend de génération de contenu :

- `apps/api/src/modules/custom-course/custom-course.service.ts` (si pas encore lu)

Cherche la/les méthode(s) qui construisent le prompt envoyé à Mistral. Reproduis **le prompt exact** envoyé à Mistral pour la génération de contenu de chapitre. Note :
1. Le prompt demande-t-il une réponse en markdown, en texte brut, ou en JSON ?
2. Y a-t-il une instruction explicite sur le format de réponse attendu ?
3. Comment la réponse Mistral est-elle stockée en base (quelle colonne, quel type TypeORM) ?

### 2C — Inspecter l'entité de stockage du contenu

Lis l'entité TypeORM qui stocke le contenu généré (probablement `GeneratedCourse` ou `CustomCourseChapter`). Note :
- Le type de colonne pour le champ contenu (`text`, `jsonb`, `varchar`)
- Si la réponse brute de Mistral est stockée telle quelle ou transformée

---

## PÉRIMÈTRE 3 — Profondeur narrative des histoires

### 3A — Localiser les prompts de génération d'histoires

Dans `apps/api/src/modules/custom-course/custom-course.service.ts` (ou fichier équivalent), cherche les méthodes qui génèrent :
- Les **histoires** (story, histoire, récit, narrative)
- Le **contenu des chapitres** hors ateliers de prompting

Reproduis **chaque prompt Mistral** utilisé pour ces générations. Note :
1. Le prompt donne-t-il des instructions sur la **structure narrative** (comment le personnage arrive à son constat, étapes de la réflexion, déclencheur de la prise de conscience) ?
2. Y a-t-il une instruction sur la profondeur / richesse des exemples ?
3. La température ou les paramètres Mistral sont-ils configurés (si oui, lesquels) ?

### 3B — Exemple problématique connu

Le cas signalé : *"Léa se rend compte que l'IA n'a pas d'émotions — on ne sait pas comment elle est arrivée à ce constat."*

Cherche dans le code :
- Comment ce type de chapitre est structuré (est-ce une étape fixe dans les 6 chapitres ?)
- Quel prompt génère ce moment narratif spécifiquement

---

## PÉRIMÈTRE 4 — Atelier de prompting

### 4A — Cartographie des fichiers

Liste récursivement tous les fichiers liés à l'atelier de prompting :

```bash
find apps/web apps/api -type f \( -name "*.tsx" -o -name "*.ts" \) | xargs grep -l "atelier\|workshop\|scoring\|score\|prompt.*eval\|eval.*prompt" 2>/dev/null
```

Lis chaque fichier trouvé. Pour chacun, note son rôle exact.

### 4B — Logique de scoring

Localise et reproduis en entier la fonction / l'API qui évalue le score d'un prompt utilisateur. Note :
1. **Qui fait l'évaluation** — frontend (appel direct à Mistral depuis le client ?), route handler Next.js, ou endpoint NestJS ?
2. **Le prompt d'évaluation exact** envoyé à Mistral (ou autre LLM) pour noter le prompt de l'utilisateur
3. **Le format de réponse attendu** : le score est-il extrait d'un JSON `{ score: 33 }` ou parsé depuis du texte libre ?
4. **Les critères de notation actuels** : sont-ils listés dans le prompt d'évaluation ? Si oui, reproduis-les.
5. **Comment le score `33` systématique peut s'expliquer** : y a-t-il un parsing fragile, une réponse mal formée, un fallback ?

### 4C — Message d'erreur incorrect

Localise le message `"recommence en structurant ta demande"` dans le code frontend :

```bash
grep -r "recommence\|structurant\|structure ta demande" apps/web --include="*.tsx" --include="*.ts" -n
```

Reproduis le bloc de code complet où ce message est défini. Note :
1. Sous quelle condition ce message s'affiche-t-il actuellement ?
2. Quelle condition aurait dû le déclencher selon le contexte fonctionnel ?
3. Y a-t-il d'autres messages d'erreur / feedback dans ce même bloc conditionnel ?

### 4D — Coloration du score

Cherche dans les composants frontend tout affichage du score numérique :

```bash
grep -r "score\|Score" apps/web/components --include="*.tsx" -n | grep -v "//\|import"
```

Note :
1. Comment le score est-il affiché (quel composant, quel élément HTML) ?
2. Y a-t-il une logique de couleur conditionnelle déjà en place (`text-green`, `text-orange`, `text-red`, ou équivalent) ?
3. Si non, quel est le style actuel appliqué au score ?

### 4E — Seuil de validation de l'atelier

Cherche la condition qui valide / débloque l'atelier :

```bash
grep -r "100\|threshold\|seuil\|validat\|unlock\|complet" apps/web/app/\(app\)/modules/custom-course --include="*.tsx" --include="*.ts" -n
```

Note :
1. Quelle valeur exacte est comparée pour valider l'atelier (hardcodé `=== 100` ? Constante ? Variable ?) ?
2. Quel fichier et quelle ligne ?
3. Quelles conséquences déclenche cette validation (mutation BDD, revalidation, animation, déblocage chapitre suivant) ?

---

## Rapport attendu

Structure ta réponse ainsi :

```
## P1 — Parcours théorique : occurrences
[Par fichier : chemin, ligne, nature, contexte]

## P1B — Arborescence des modules
[Dossiers et routes exacts de custom-course et parcours-theorique]

## P2 — Rendu markdown
[Comment le contenu est affiché, librairie utilisée ou absence, prompt Mistral, format stocké]

## P3 — Profondeur narrative
[Prompts de génération d'histoires, instructions narratives présentes ou absentes]

## P4A — Atelier de prompting : fichiers impliqués
[Liste avec rôle de chaque fichier]

## P4B — Logique de scoring
[Prompt d'évaluation exact, format de réponse, critères actuels, explication du 33 systématique]

## P4C — Message d'erreur incorrect
[Code source + condition actuelle + condition attendue]

## P4D — Coloration du score
[Composant, style actuel, logique couleur existante ou absente]

## P4E — Seuil de validation
[Valeur exacte, fichier:ligne, conséquences]

## Dettes supplémentaires observées
[Toute anomalie, any TypeScript, violation CNIL potentielle repérée pendant l'audit]
```

---

## Règles non-négociables

- **Ne modifie aucun fichier**
- Si un fichier n'existe pas à l'emplacement supposé, dis-le explicitement et cherche l'équivalent réel
- Cite les numéros de ligne pour chaque preuve
- Si la structure de fichiers diffère de la spec, documente la réalité
- Signale tout `any` TypeScript croisé
- Signale toute violation CNIL potentielle
