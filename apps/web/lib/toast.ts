import { toast } from 'sonner';

export const notify = {
  success: {
    login:         () => toast.success('Connexion réussie', { description: 'Bon retour !' }),
    register:      () => toast.success('Compte créé', { description: 'Bienvenue sur AI·Edu !' }),
    logout:        () => toast.success('Déconnexion réussie'),
    profileUpdated:() => toast.success('Profil mis à jour'),
    consent:       () => toast.success('Demande envoyée', { description: 'Ton parent recevra un email de validation.' }),
  },
  error: {
    login:              () => toast.error('Connexion impossible', { description: 'Vérifie ton email et ton mot de passe.' }),
    loginGoogle:        () => toast.error('Connexion Google échouée', { description: 'Réessaie ou utilise un email/mot de passe.' }),
    emailAlreadyExists: () => toast.error('Email déjà utilisé', { description: 'Connecte-toi ou utilise une autre adresse.' }),
    register:           () => toast.error('Inscription impossible', { description: 'Vérifie les informations et réessaie.' }),
    generic:            () => toast.error('Une erreur est survenue', { description: 'Réessaie dans quelques instants.' }),
    network:            () => toast.error('Serveur inaccessible', { description: 'Vérifie ta connexion et réessaie.' }),
    scoring:            () => toast.error('Évaluation impossible', { description: 'Réessaie dans quelques instants.' }),
    courseGen:          () => toast.error('Génération échouée', { description: 'Réessaie dans quelques instants.' }),
    consent:            () => toast.error('Erreur lors de l\'envoi', { description: 'Réessaie dans quelques instants.' }),
  },
  info: {
    loading: (msg = 'Chargement…') => toast.loading(msg),
  },
  xp: {
    /** Toast "+N XP !" affiché après une bonne réponse */
    gained: (amount: number) => toast(`+${amount} XP !`, {
      description: amount >= 100 ? '🔥 Excellent travail !' : 'Continue comme ça !',
      duration:    2500,
      style: {
        background:  'rgba(16,185,129,0.15)',
        border:      '1px solid rgba(16,185,129,0.3)',
        color:       '#10B981',
        fontWeight:  '600',
      },
    }),
    levelUp: (level: number) => toast(`⬆️ Niveau ${level} atteint !`, {
      description: 'Tu progresses vite, bravo !',
      duration:    4000,
      style: {
        background:  'rgba(76,31,212,0.2)',
        border:      '1px solid rgba(123,82,240,0.4)',
        color:       '#7B52F0',
        fontWeight:  '700',
      },
    }),
    streakBonus: (days: number) => toast(`🔥 ${days} jours de suite !`, {
      description: 'Bonus de streak appliqué.',
      duration:    3000,
    }),
  },
};
