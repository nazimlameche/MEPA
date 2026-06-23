"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LEVEL_THRESHOLDS = exports.XP_REWARDS = exports.MODULE_CONFIGS = void 0;
exports.MODULE_CONFIGS = [
    {
        id: 'theory',
        label: 'Parcours Théorique',
        category: 'theory',
        icon: 'BookOpen',
        route: '/modules/theory',
        requiredRoles: ['collegien', 'lyceen', 'enseignant', 'professionnel', 'autre', 'admin'],
        isActive: true,
        order: 1,
    },
    {
        id: 'prompting',
        label: 'Atelier Prompting',
        category: 'practice',
        icon: 'Wand2',
        route: '/modules/prompting',
        requiredRoles: ['collegien', 'lyceen', 'enseignant', 'professionnel', 'autre', 'admin'],
        isActive: true,
        order: 2,
    },
    {
        id: 'sandbox',
        label: 'Bac à Sable',
        category: 'sandbox',
        icon: 'MessageSquare',
        route: '/sandbox',
        requiredRoles: ['collegien', 'lyceen', 'enseignant', 'professionnel', 'autre', 'admin'],
        isActive: true,
        order: 3,
    },
    {
        id: 'custom-course',
        label: 'Cours Sur-Mesure',
        category: 'generated',
        icon: 'Sparkles',
        route: '/custom-course',
        requiredRoles: ['collegien', 'lyceen', 'enseignant', 'professionnel', 'autre'],
        isActive: true,
        order: 4,
    },
];
exports.XP_REWARDS = {
    COURSE_COMPLETE: 50,
    QUIZ_CORRECT: 10,
    DAILY_STREAK: 20,
    FIRST_LOGIN: 5,
};
exports.LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400, 2000, 2750, 3650, 4700, 6000];
//# sourceMappingURL=modules.js.map