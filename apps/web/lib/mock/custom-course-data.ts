import type { SavedCourse } from '@/lib/types/custom-course';

export const mockSavedCourses: SavedCourse[] = [
  {
    id: 'gen-001',
    title: "L'IA dans le sport : comment les algorithmes analysent les performances",
    generatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    level: 'lycee',
    estimatedMinutes: 8,
    blocks: [
      {
        type: 'text',
        content: "Les entraîneurs utilisent aujourd'hui des **systèmes d'IA** pour analyser les performances des athlètes en temps réel. Des capteurs collectent des milliers de données par seconde : vitesse, accélération, fréquence cardiaque, position.",
      },
      {
        type: 'tip',
        content: "💡 Des clubs comme le Paris Saint-Germain utilisent des IA pour prédire le risque de blessure de leurs joueurs avant même qu'ils ressentent de la douleur.",
      },
      {
        type: 'quiz',
        question: "Quel est l'un des usages principaux de l'IA dans le sport professionnel ?",
        options: [
          "Remplacer les arbitres humains",
          "Analyser les performances et prévenir les blessures",
          "Choisir les équipes à la place des entraîneurs",
          "Vendre des billets automatiquement",
        ],
        correct_index: 1,
        explanation: "L'IA est principalement utilisée pour analyser les données de performance et anticiper les blessures, pas pour remplacer les décisions humaines.",
      },
    ],
  },
];
