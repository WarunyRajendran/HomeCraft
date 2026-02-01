import { useAuth } from './useAuth';

// Note: La colonne is_admin n'existe pas encore dans la table profiles.
// Pour l'instant, on utilise une liste d'emails admin en dur.
// TODO: Ajouter la colonne is_admin à la table profiles quand nécessaire.

const ADMIN_EMAILS = ['admin@homecraft.com', 'waruny@hotmail.fr'];

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();

  // Simple check based on email for now
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  return {
    user,
    isAdmin,
    isLoading: authLoading,
  };
};