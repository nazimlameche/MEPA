# Cours Professeur — L'IA pour les enseignants

> Profil : enseignants du primaire, collège et lycée
> Ce cours s'appuie sur le cours général et y ajoute les enjeux pédagogiques, les droits, les risques spécifiques à l'exercice du métier d'enseignant et les bonnes pratiques en classe.

---

## 1. L'IA dans la classe : état des lieux 2025

Les chiffres sont sans appel : en France, **plus de 90 % des lycéens de seconde** ont déjà utilisé une IA générative pour faire leurs devoirs. En 2025, selon le baromètre Born AI, **93 % des 18-25 ans** ont utilisé un outil d'IA dans les six derniers mois, et **42 %** l'utilisent quotidiennement — soit deux fois plus qu'en 2024.

L'IA est dans vos classes. La question n'est plus "faut-il l'autoriser ?" mais **"comment l'encadrer et l'enseigner ?"**

> 📌 **Point d'attention** : les élèves utilisent principalement l'IA pour leurs devoirs (résumés, rédactions, corrections), mais aussi pour des échanges interpersonnels via des IA compagnes. 72 % des 13-17 ans aux États-Unis déclarent avoir utilisé un "AI companion" en 2025.

---

## 2. Données des élèves et RGPD — vos obligations

En tant qu'enseignant, vous manipulez des **données personnelles d'élèves mineurs**. C'est une catégorie de données particulièrement sensible au regard du RGPD.

**Ce que vous ne pouvez pas faire :**
- Saisir des notes, des appréciations ou des noms d'élèves dans un outil IA grand public (ChatGPT, Gemini, Claude sans accord institutionnel)
- Utiliser des photos d'élèves comme input d'une IA
- Demander aux élèves de se connecter à un service IA avec leur vrai identité sans information préalable

**Exemple à risque :**
> *"Je suis prof de maths au collège Victor Hugo à Lyon, voici les notes de ma classe : [liste]"*
> Ce prompt est problématique : il identifie l'établissement **et** contient des données d'élèves. Double violation potentielle du RGPD.

**Ce que vous pouvez faire :**
- Anonymiser systématiquement (remplacer les noms par "Élève A", "Élève B")
- Utiliser des outils IA validés par votre établissement ou par l'Éducation nationale
- Former les élèves à ne jamais inclure d'informations personnelles dans leurs prompts

> 📋 **Ressource** : la CNIL a publié des recommandations spécifiques sur l'usage de l'IA dans les établissements scolaires. Consultez-les sur cnil.fr avant de déployer tout outil.

---

## 3. Triche et IA — redéfinir les cadres

La question de la triche avec l'IA est complexe. Les détecteurs de contenu IA (GPTZero, etc.) ne sont pas fiables et génèrent des faux positifs — accuser un élève à tort peut avoir des conséquences graves.

**Une approche plus efficace que la détection :**

- **Contextualiser les productions** : demander une note d'intention, une présentation orale du travail, un carnet de bord de la rédaction
- **Intégrer l'IA dans l'évaluation** : évaluer la capacité à utiliser l'IA de façon critique plutôt que de l'interdire
- **Changer les formats** : privilégier les productions qui nécessitent une expérience personnelle, une observation in situ, une argumentation orale

**Distinction utile pour vos élèves :**

| Usage de l'IA | Qualification |
|---|---|
| Comprendre un concept flou | Aide légitime |
| Corriger une tournure grammaticale | Aide légitime |
| Générer des idées de plan | Aide légitime |
| Faire rédiger le devoir en entier | Triche |
| Soumettre le texte IA sans le relire | Triche + risque d'hallucinations |

---

## 4. Biais algorithmiques — un enjeu pédagogique

Les biais dans les IA reproduisent et amplifient les préjugés présents dans les données d'entraînement. C'est un sujet à enseigner activement.

**Expérience de classe possible :**
Demandez à une IA de générer une image de "médecin", puis de "chirurgien", puis d'"infirmière". Observez et discutez avec les élèves des stéréotypes reproduits.

**Cas documentés :**
- Des IA de recrutement ont systématiquement défavorisé les CV de femmes car entraînées sur des données historiques biaisées
- Des algorithmes de reconnaissance faciale ont des taux d'erreur bien plus élevés pour les personnes non-blanches
- Des IA médicales recommandent moins souvent des traitements coûteux pour certains groupes ethniques

**Ce que ça signifie pour vos élèves :** l'IA n'est pas neutre. Elle reflète les inégalités du monde dans lequel elle a été entraînée. L'esprit critique face à ses outputs est une compétence fondamentale.

---

## 5. Prompting itératif — la méthode pour un usage pro

Pour les usages pédagogiques avancés (préparation de cours, différenciation, création d'exercices), un prompting structuré en 5 phases produit des résultats bien supérieurs.

**Les 5 phases du prompting itératif :**

| Phase | Objectif | Exemple |
|---|---|---|
| 1 — Cadre général | Poser le contexte et la demande large | "Je prépare un cours de 3h sur la Révolution française pour des 4e." |
| 2 — Questionnement | Inviter l'IA à poser des questions pour affiner | "Quelles informations te seraient utiles pour m'aider au mieux ?" |
| 3 — Ajout de détails | Répondre aux questions de l'IA, préciser les contraintes | "Il y a 28 élèves, niveau hétérogène, 4 élèves DYS." |
| 4 — Affinage ton/format | Préciser la mise en forme attendue | "Présente le plan sous forme de tableau, avec durée et objectif pour chaque séquence." |
| 5 — Test de robustesse | Questionner la réponse, demander des alternatives | "Est-ce que ce plan fonctionne si je n'ai que 2h ? Propose une version allégée." |

> ✅ Cette approche produit des résultats beaucoup plus utiles qu'un seul prompt long et chargé.

---

## 6. Hallucinations — risques spécifiques pour l'enseignement

Le risque d'hallucination est particulièrement critique dans un contexte éducatif. L'IA peut :
- Inventer des dates historiques
- Attribuer de fausses citations à des auteurs réels
- Décrire des expériences scientifiques inexistantes
- Citer des textes de loi abrogés ou inexistants

**Protocole recommandé avant d'utiliser un contenu IA en classe :**
1. Vérifier chaque fait factuel dans une source primaire
2. Ne jamais présenter un contenu IA comme garanti sans vérification
3. En faire un exercice pédagogique : demander aux élèves de vérifier les affirmations de l'IA

---

## Quiz — Niveau professeur

**Q1.** Un élève soumet ce prompt : *"Je suis prof de maths au collège Victor Hugo à Lyon, voici les notes de ma classe : [liste]"*. Quel est le problème ?
- A) Le prompt est trop court
- B) Il contient des données personnelles identifiables (établissement + données élèves) ✅
- C) Il manque un output attendu
- D) L'IA ne peut pas traiter des notes

**Q2.** Pourquoi est-il risqué de faire confiance aveuglément à une réponse d'IA dans un contexte professionnel ?
- A) L'IA refuse souvent de répondre aux questions pro
- B) L'IA peut produire du contenu plausible mais factuellement faux sans le signaler ✅
- C) Les réponses IA sont toujours trop courtes
- D) L'IA ne comprend pas le jargon professionnel

**Q3.** La Phase 1 du prompting itératif consiste à :
- A) Donner tous les détails possible dès le départ
- B) Poser une requête simple qui pose le cadre général ✅
- C) Demander à l'IA de se présenter
- D) Spécifier immédiatement le format de sortie

**Q4.** La Phase 2 du prompting itératif consiste à :
- A) Réécrire entièrement le prompt
- B) Demander à l'IA quelles précisions lui seraient utiles ✅
- C) Changer de modèle d'IA
- D) Valider la réponse finale

**Q5.** Tu veux itérer un prompt professionnel. Quelle est la bonne première étape (Phase 1) ?
- A) Donner tous les détails possible dès le départ
- B) Poser une requête simple qui pose le cadre général ✅
- C) Demander à l'IA de se présenter
- D) Spécifier immédiatement le format de sortie

**Q6.** Une IA conversationnelle "se souvient-elle" de tes conversations pour toujours ?
- A) Oui, tout est stocké indéfiniment
- B) Ça dépend de la plateforme et de ses conditions d'utilisation ✅
- C) Non, jamais
- D) Seulement si tu crées un compte

**Q7.** Quelle est la méthode la plus fiable pour détecter un devoir rédigé par une IA ?
- A) Utiliser un détecteur comme GPTZero
- B) Comparer avec les travaux précédents de l'élève
- C) Il n'existe pas de méthode fiable à 100% — contextualiser les productions est plus efficace ✅
- D) Demander à l'élève

**Q8.** Quelle attitude est la plus saine face à une réponse d'IA ?
- A) La copier-coller directement
- B) La rejeter systématiquement
- C) La lire de manière critique, vérifier les faits importants et l'adapter ✅
- D) La partager immédiatement aux élèves
