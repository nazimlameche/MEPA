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
};
