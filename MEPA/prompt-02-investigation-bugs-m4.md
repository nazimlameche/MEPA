# Prompt 02 — Investigation ciblée des bugs UX M4 (Cours Sur-Mesure)

> **Prérequis** : L'audit de structure (prompt-01) a été exécuté. Ce prompt utilise ses résultats.  
> **Objectif** : Confirmer ou infirmer les hypothèses de cause racine pour 4 bugs. Ne pas corriger — lire et diagnostiquer.

---

## Contexte du projet

**AI-Edu** — plateforme gamifiée Next.js 15 App Router + NestJS + TypeScript strict + Tailwind CSS v4 + Framer Motion + shadcn/ui + NextAuth v5.

**Ce qu'on sait déjà de l'audit :**
- Les modales "Changer de thème" et "Supprimer" dans `ParcoursDashboard.tsx` sont des `motion.div` avec `<AnimatePresence>` — pas des Radix Portals
- La suppression (`deleteParcours`) commence par un `getParcours` (ownership check) qui eager-load les 6 chapitres avec tout leur contenu JSONB avant de DELETE (dette D13)
- Le flow post-action : `apiClient.delete` → `revalidateParcours()` Server Action → `router.push`
- `changing` et `deleting` sont des booleans de state dans `ParcoursDashboard.tsx`, mais leur utilisation réelle n'est pas confirmée
- La config `lib/auth.ts` n'a pas encore été lue (callbacks non vérifiés)

---

## Étape 1 — Lire `ParcoursDashboard.tsx` en entier

Lis et reproduis le contenu complet de `apps/web/components/custom-course/ParcoursDashboard.tsx`.

Pendant la lecture, note :

1. **Structure des modales** : Sont-elles directement dans le JSX du composant (inline) ou dans un `createPortal` / composant shadcn `<Dialog>` qui monte dans `document.body` ?
2. **Position CSS de l'overlay** : `position: fixed` ou `position: absolute` ? Quel `z-index` ?
3. **Handler "Changer de thème"** : Quelle est la fonction déclenchée au clic du bouton de confirmation ? Reproduis-la en entier (nom, corps, ordre des opérations).
4. **Handler "Supprimer"** : Même question.
5. **Utilisation de `changing` et `deleting`** : Ces booleans sont-ils effectivement liés à un spinner, état disabled sur le bouton, ou texte de chargement visible dans le JSX ?
6. **`useTransition` ou `startTransition`** : Présent ou absent dans ce composant ?
7. **Fermeture de la modale** : La modale se ferme-t-elle (`showDeleteModal = false` / `showChangeThemeModal = false`) AVANT ou APRÈS l'appel API ?

---

## Étape 2 — Lire `apps/web/app/(app)/layout.tsx` en entier

Lis et reproduis le contenu complet du layout principal.

Pendant la lecture, note :

1. **Classes Tailwind sur les wrappers** : Y a-t-il `overflow-hidden`, `overflow-auto`, `overflow-y-scroll` sur le `<body>`, un `<div>` racine, ou le conteneur principal ?
2. **Animations Framer Motion** : Y a-t-il un `<motion.div>` wrappant le contenu des pages (ex : animation de transition de page) ? Si oui, a-t-il une prop `initial`, `animate`, ou une prop CSS `transform` ?
3. **Position du header/navbar** : Est-il `position: fixed` ou `position: sticky` ? Quel `z-index` est appliqué (Tailwind `z-*` ou style inline) ?
4. **Structure HTML** : Décris la hiérarchie DOM entre le header et le contenu de page (quelle div wrape quoi).

---

## Étape 3 — Lire `apps/web/lib/auth.ts` en entier

Lis et reproduis le contenu complet du fichier de configuration NextAuth.

Pendant la lecture, note :

1. **Type de session** : `strategy: 'jwt'` ou `strategy: 'database'` dans les options `session` ?
2. **Callback `signOut`** : Existe-t-il un callback `events.signOut` ou similaire ? Si oui, reproduis-le. Contient-il des opérations `await` (Redis, base de données, audit log) ?
3. **Callback `session`** : Fait-il des appels externes (BDD, Redis) à chaque invocation ?
4. **Callback `jwt`** : Fait-il des appels externes ?
5. **`pages.signOut`** : Y a-t-il une route de déconnexion personnalisée ?

---

## Étape 4 — Lire le composant de déconnexion

Lis `apps/web/components/layout/AppSidebar.tsx`.

Pendant la lecture, note :

1. **Handler du bouton "Déconnexion"** : Reproduis la fonction exacte appelée au clic.
2. **État de chargement** : Y a-t-il un `useState` pour un état `isSigningOut` ou similaire ? Le bouton est-il disabled ou affiche-t-il un spinner pendant `signOut()` ?
3. **Import de `signOut`** : Vient-il de `next-auth/react` (client-side) ou de `@/lib/auth` (server-side) ?

---

## Étape 5 — Lire le service NestJS `deleteParcours`

Lis `apps/api/src/modules/custom-course/custom-course.service.ts`.

Cherche la méthode `deleteParcours` (ou équivalent). Reproduis-la en entier et note :

1. **Séquence des opérations** : Dans quel ordre sont les `await` ? Y a-t-il d'abord un `findOne` (ownership check) qui charge les chapters avant le `delete` ?
2. **Audit log** : Est-il `await`é dans la même requête (synchrone) ou déclenché sans attendre (fire-and-forget) ?
3. **Redis** : Y a-t-il une invalidation de cache Redis dans ce flow ?
4. **Cascade** : La suppression cascade est-elle gérée par TypeORM (`CASCADE`) ou par des `delete` manuels en séquence ?

---

## Rapport attendu

```
## Bug A — Header coupé à l'ouverture de modale

Hypothèse : Les modales sont des motion.div inline (pas de Portal), et un parent a un
transform actif (Framer Motion ou Tailwind) qui crée un nouveau containing block pour
position: fixed, désalignant l'overlay par rapport au viewport.

- Confirmée / Infirmée
- Preuve : [extrait de code avec numéro de ligne]
- Si infirmée : cause alternative observée

## Bug B — Changement de thème lent et sans feedback clair

Hypothèse 1 : La modale ne se ferme pas avant la fin de l'appel API → l'utilisateur
attend devant la modale ouverte.
- Confirmée / Infirmée / [ligne où setShow = false est appelé]

Hypothèse 2 : `changing = true` n'est pas relié à un feedback visuel dans le JSX.
- Confirmée / Infirmée

Hypothèse 3 : D13 — `deleteParcours` appelle `getParcours` avec eager loading des
chapters (JSONB) avant DELETE → overhead réseau + BDD inutile.
- Confirmée / Infirmée / [méthode exacte dans le service]

Hypothèse 4 : `revalidateParcours()` est un second aller-retour serveur exécuté AVANT
router.push → délai additionnel.
- Confirmée / Infirmée

## Bug C — Suppression lente, pas d'animation de sortie sur la carte

Mêmes hypothèses que Bug B (même code path).

En plus :
- Y a-t-il une exit animation (`exit` prop Framer Motion) sur l'item supprimé dans la
  liste des anciens parcours ?
- Confirmée / Infirmée / [ligne]

## Bug D — Déconnexion lente

Hypothèse 1 : Un callback NextAuth (`events.signOut`, `session`, ou `jwt`) fait une
opération async (Redis, BDD, audit log) qui bloque le retour de `signOut()`.
- Confirmée / Infirmée / [extrait du callback]

Hypothèse 2 : Pas d'état de chargement sur le bouton → l'utilisateur ne voit rien
pendant que signOut() s'exécute, ce qui amplifie la perception de lenteur.
- Confirmée / Infirmée

Type de session NextAuth configuré : [jwt / database]

## Résumé — Causes racines confirmées
[1 ligne par bug avec la cause exacte et le fichier:ligne]

## Causes à éliminer
[Hypothèses infirmées]
```

---

## Règles non-négociables

- **Ne modifie aucun fichier** — lecture et diagnostic uniquement
- Cite les numéros de ligne pour chaque preuve
- Si un fichier n'existe pas à l'emplacement indiqué, dis-le explicitement et cherche un équivalent
- Signale tout `any` TypeScript croisé
- Si tu identifies d'autres bugs en lisant ces fichiers, note-les en section "Bugs supplémentaires observés"
