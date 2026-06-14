# Cours Pro — L'IA en contexte professionnel

> Profil : adultes et professionnels en entreprise
> Ce cours s'appuie sur le cours général et y ajoute les enjeux juridiques, de confidentialité, de productivité et de gouvernance spécifiques au monde du travail.

---

## 1. L'IA en entreprise — état des lieux 2025

En France, selon une étude de l'INSEE publiée en 2024, **10 % des entreprises** déclarent utiliser au moins une technologie d'IA. Parmi les 18-24 ans actifs, **plus de 70 %** utilisent l'IA générative au quotidien, y compris dans le cadre professionnel.

Mais l'adoption massive cache un problème critique : **la majorité des utilisateurs professionnels n'ont reçu aucune formation** sur les risques spécifiques à l'usage de l'IA en entreprise.

> ⚠️ **Cas réel documenté** : des salariés d'une entreprise française ont utilisé une IA générative grand public pour traduire des documents confidentiels, sans l'aval de leur hiérarchie. Ces données sensibles ont potentiellement été utilisées pour réentraîner le modèle. Ce type d'incident peut engager la responsabilité de l'entreprise et du salarié.

---

## 2. Le cadre légal à connaître absolument

### RGPD et IA

Le **Règlement Général sur la Protection des Données** s'applique pleinement aux systèmes d'IA. Les points clés :

- **Minimisation des données** : ne collecter que ce qui est strictement nécessaire
- **Consentement** : toute collecte de données personnelles nécessite une base légale
- **Droit à l'oubli** : les individus peuvent demander la suppression de leurs données — ce qui pose un défi technique pour les LLM (des travaux de recherche sur le "machine unlearning" sont en cours)
- **Décisions automatisées** : interdiction de prendre des décisions impactant significativement une personne sur la seule base d'un algorithme, sans intervention humaine

### AI Act européen (2024)

Premier cadre réglementaire mondial complet sur l'IA, entré en vigueur en juillet 2024. Il classe les systèmes d'IA par niveau de risque :

| Niveau | Exemples | Obligations |
|---|---|---|
| Inacceptable | Notation sociale, manipulation psychologique | Interdits |
| Haut risque | Recrutement, crédit, justice, médical | Audit, transparence, supervision humaine |
| Limité | Chatbots, deepfakes | Obligation d'information |
| Minimal | Filtres spam, recommandations | Pas d'obligation spécifique |

> 📌 L'AI Act **ne remplace pas** le RGPD. Les deux s'appliquent simultanément.

### Confidentialité des données d'entreprise

Votre employeur peut légalement **restreindre ou interdire** l'usage de certains outils IA. En l'absence d'instructions, la règle de prudence s'applique.

**Ne jamais envoyer à une IA grand public :**
- Données clients (noms, contrats, coordonnées)
- Informations financières non publiques
- Propriété intellectuelle (code source, brevets, processus internes)
- Comptes-rendus de réunions stratégiques
- Données RH (salaires, évaluations, situations personnelles)

---

## 3. Prompt engineering professionnel — la méthode RCTFC

Pour produire des résultats fiables et utilisables en contexte professionnel, structurez vos prompts selon la méthode **RCTFC** :

| Lettre | Signifie | Exemple |
|---|---|---|
| **R** | Rôle | "Tu es un juriste spécialisé en droit du travail français." |
| **C** | Contexte | "Je prépare un entretien annuel pour un salarié en CDI." |
| **T** | Tâche | "Rédige une trame d'entretien avec 5 questions ouvertes." |
| **F** | Format | "Sous forme de liste numérotée, avec pour chaque question l'objectif visé." |
| **C** | Contraintes | "Langage professionnel mais accessible, éviter le jargon RH." |

**Exemple complet :**
> *"Tu es un expert en communication interne. Dans le contexte d'une réorganisation d'équipe, rédige un email d'annonce aux collaborateurs. Format : 3 paragraphes maximum, ton rassurant mais factuel, sans mentionner de noms ni de postes spécifiques."*

---

## 4. Prompting itératif — les 5 phases

Un bon prompt professionnel se construit rarement en une seule fois. La méthode en 5 phases produit des résultats bien supérieurs :

**Phase 1 — Cadre général**
Posez le contexte sans surcharger. L'IA doit comprendre la situation générale.
> *"Je dois préparer une présentation sur notre stratégie commerciale pour le prochain CODIR."*

**Phase 2 — Questionnement**
Invitez l'IA à identifier ce dont elle a besoin pour vous aider au mieux.
> *"Quelles informations te seraient utiles pour m'aider à structurer cette présentation ?"*

**Phase 3 — Ajout de détails**
Répondez aux questions, ajoutez les contraintes spécifiques.
> *"La présentation dure 20 minutes, public de 8 directeurs, objectif : valider un budget de 2M€. Pas de données chiffrées confidentielles dans le document."*

**Phase 4 — Affinage**
Précisez le ton, le format, le niveau de détail.
> *"Présente le plan sous forme de tableau avec : titre de slide, message clé, données ou visuels recommandés."*

**Phase 5 — Test de robustesse**
Challenger la réponse, demander des alternatives ou des objections.
> *"Quelles objections typiques un CODIR pourrait-il soulever ? Comment les anticiper dans la présentation ?"*

---

## 5. Hallucinations en contexte professionnel — risques concrets

Les hallucinations de l'IA peuvent avoir des conséquences directes en entreprise :

- **Juridique** : une IA peut citer une loi abrogée, un article inexistant, une jurisprudence inventée
- **Financier** : des chiffres sectoriels ou des benchmarks peuvent être fabriqués
- **Réputation** : un contenu factuellemnet erroné publié sous votre nom engage votre responsabilité

**Protocole de vérification recommandé :**
1. Tout fait chiffré → vérifier dans la source primaire
2. Toute référence légale → vérifier sur Légifrance ou auprès d'un juriste
3. Tout contenu destiné à être publié ou transmis → relecture humaine systématique

> 💡 **Règle professionnelle** : traitez toujours la première réponse d'une IA comme un **brouillon**, jamais comme un résultat final.

---

## 6. Biais et décisions algorithmiques en entreprise

Si votre entreprise utilise l'IA pour des décisions RH (recrutement, évaluation, promotion), des décisions commerciales (scoring client, pricing) ou des décisions opérationnelles (gestion des stocks, planification), vous devez être conscient des risques de biais.

**Exemples documentés :**
- Amazon a dû abandonner un outil de recrutement IA en 2018 car il pénalisait systématiquement les CV de femmes
- Des algorithmes de crédit ont été jugés discriminatoires aux États-Unis car défavorisant des minorités ethniques
- Des outils de reconnaissance faciale déployés en sécurité ont des taux d'erreur jusqu'à 10 fois plus élevés sur les visages non-blancs

**Votre responsabilité :**
Sous l'AI Act, les systèmes IA à haut risque (dont le recrutement) nécessitent une supervision humaine effective. Déléguer une décision importante entièrement à un algorithme sans contrôle humain peut engager votre responsabilité.

---

## 7. Impact environnemental — enjeu de gouvernance

L'empreinte carbone de l'IA est un sujet de gouvernance d'entreprise croissant, notamment pour les rapports RSE.

**Ordres de grandeur :**
- Une requête ChatGPT-4 consomme environ 10 fois plus qu'une recherche Google
- La génération d'une image HD par une IA consomme autant qu'une recharge complète de téléphone
- Les data centers liés à l'IA représentaient ~2 % de la production électrique mondiale en 2022

**Bonnes pratiques d'usage sobre :**
- Définir des cas d'usage prioritaires plutôt qu'un usage tous azimuts
- Préférer des modèles plus légers pour des tâches simples
- Évaluer le ROI réel de chaque intégration IA avant déploiement

---

## Quiz — Niveau professionnel

**Q1.** Un collègue utilise ChatGPT pour traduire un contrat client confidentiel. Quel est le risque principal ?
- A) La traduction sera de mauvaise qualité
- B) Les données confidentielles peuvent être utilisées pour réentraîner le modèle ✅
- C) C'est interdit par la loi française
- D) Il n'y a pas de risque si le contrat est en PDF

**Q2.** Pourquoi est-il risqué de faire confiance aveuglément à une réponse d'IA dans un contexte professionnel ?
- A) L'IA refuse souvent de répondre aux questions pro
- B) L'IA peut produire du contenu plausible mais factuellement faux sans le signaler ✅
- C) Les réponses IA sont toujours trop courtes
- D) L'IA ne comprend pas le jargon professionnel

**Q3.** La Phase 2 du prompting itératif consiste à :
- A) Réécrire entièrement le prompt
- B) Demander à l'IA quelles précisions lui seraient utiles ✅
- C) Changer de modèle d'IA
- D) Valider la réponse finale

**Q4.** Quelle attitude est la plus saine face à une réponse d'IA ?
- A) La copier-coller directement, l'IA est experte
- B) La rejeter, on ne peut jamais faire confiance à une IA
- C) La lire de manière critique, vérifier les faits importants et l'adapter ✅
- D) La partager immédiatement

**Q5.** Votre employeur peut-il interdire l'usage de ChatGPT au travail ?
- A) Non, c'est un outil personnel
- B) Oui, pour des raisons de confidentialité et de conformité ✅
- C) Uniquement si vous l'utilisez sur le réseau de l'entreprise
- D) Non, l'AI Act interdit cette restriction

**Q6.** Laquelle de ces informations est risquée à partager avec une IA grand public ?
- A) Le secteur d'activité de votre entreprise
- B) L'adresse email professionnelle d'un client ✅
- C) Le nom d'un concurrent public
- D) Votre intitulé de poste

**Q7.** Que signifie l'acronyme RCTFC dans le prompt engineering professionnel ?
- A) Résultat, Contrainte, Temps, Fichier, Contrôle
- B) Rôle, Contexte, Tâche, Format, Contraintes ✅
- C) Requête, Cible, Texte, Feedback, Correction
- D) Ce n'est pas un acronyme reconnu

**Q8.** Quelle action réduit concrètement l'empreinte carbone de ton usage de l'IA ?
- A) Écrire des prompts plus longs pour être sûr
- B) Régénérer la réponse jusqu'à ce qu'elle soit parfaite
- C) Formuler des prompts précis dès le premier essai ✅
- D) Utiliser l'IA uniquement sur mobile
