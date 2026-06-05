import type { CourseListItem, Course } from '@/lib/types/course';

export const mockCourseList: CourseListItem[] = [
  {
    id: 'what-is-ai',
    title: "Qu'est-ce qu'une IA ?",
    description: "Comprendre ce qu'est l'intelligence artificielle et comment elle fonctionne.",
    level: 1,
    tier: 1,
    xpReward: 10,
    estimatedMinutes: 5,
    completed: true,
  },
  {
    id: 'ai-types',
    title: "Les types d'IA",
    description: "Découvrir les différentes catégories d'IA et leurs usages.",
    level: 1,
    tier: 2,
    xpReward: 10,
    estimatedMinutes: 6,
    completed: true,
  },
  {
    id: 'how-llm-works',
    title: 'Comment fonctionne un LLM ?',
    description: 'Comprendre le fonctionnement des grands modèles de langage.',
    level: 1,
    tier: 3,
    xpReward: 15,
    estimatedMinutes: 8,
    completed: false,
  },
  {
    id: 'ai-risks',
    title: "Les risques de l'IA",
    description: "Identifier les principaux risques et biais des systèmes d'IA.",
    level: 2,
    tier: 1,
    xpReward: 15,
    estimatedMinutes: 7,
    completed: false,
  },
  {
    id: 'ai-and-data',
    title: 'IA et données personnelles',
    description: "Comprendre comment les IA utilisent nos données et nos droits RGPD.",
    level: 2,
    tier: 2,
    xpReward: 20,
    estimatedMinutes: 10,
    completed: false,
  },
];

export const mockCourses: Record<string, Course> = {
  'how-llm-works': {
    id: 'how-llm-works',
    moduleId: 'theory',
    title: 'Comment fonctionne un LLM ?',
    description: 'Comprendre le fonctionnement des grands modèles de langage.',
    level: 1,
    tier: 3,
    xpReward: 15,
    estimatedMinutes: 8,
    blocks: [
      {
        type: 'text',
        content: `Un **LLM** (Large Language Model) est un programme entraîné sur d'immenses quantités de texte. Il apprend à prédire quel mot vient après un autre — encore et encore, des milliards de fois.\n\nRésultat : il devient très doué pour générer du texte qui *ressemble* à du texte humain. Mais attention : il ne "comprend" pas vraiment ce qu'il écrit.`,
      },
      {
        type: 'story',
        title: "L'histoire du perroquet statistique",
        narrative: `Imagine un perroquet qui a lu tous les livres du monde. Il peut répéter des phrases qui sonnent juste, répondre à des questions, même écrire des poèmes. Mais si tu lui demandes s'il fait vraiment nuit dehors, il ne peut que deviner — il n'a pas de fenêtre.`,
        moral: "Un LLM, c'est un peu ça : brillant pour assembler des mots, limité pour percevoir la réalité.",
      },
      {
        type: 'quiz',
        question: 'Comment un LLM génère-t-il du texte ?',
        options: [
          'Il cherche dans une base de données de réponses préfabriquées',
          'Il prédit le mot le plus probable à chaque étape',
          "Il copie des phrases déjà lues pendant l'entraînement",
          'Il comprend le sens profond de chaque phrase',
        ],
        correct_index: 1,
        explanation: "Un LLM prédit statistiquement le token suivant à chaque étape. Ce n'est pas de la compréhension au sens humain — c'est une prédiction très sophistiquée.",
      },
      {
        type: 'fill_blank',
        sentence: 'Un LLM est entraîné à prédire le ___ suivant dans une séquence de texte.',
        blank_word: 'mot',
        hint: "L'unité de base du texte.",
      },
      {
        type: 'tip',
        content: "💡 Les LLM peuvent se tromper avec confiance. Toujours vérifier les informations importantes auprès de sources fiables.",
      },
      {
        type: 'quiz',
        question: "Qu'est-ce qu'un LLM NE peut PAS faire de manière fiable ?",
        options: [
          'Résumer un texte',
          'Traduire une phrase',
          "Vérifier si une information est vraie en ce moment",
          'Répondre à une question de culture générale',
        ],
        correct_index: 2,
        explanation: "Les LLM n'ont pas accès à Internet en temps réel (sauf outils spécifiques). Leurs connaissances ont une date de coupure et ils peuvent \"halluciner\" des faits.",
      },
    ],
  },
};
