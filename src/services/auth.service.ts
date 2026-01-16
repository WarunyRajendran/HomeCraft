import { supabase } from '@/integrations/supabase/client';

export const authService = {
  signUp: async (email: string, password: string, fullName: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) throw authError;

    // Le profil sera créé automatiquement par le trigger PostgreSQL
    return authData;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  signOut: async () => {
    // Tenter la déconnexion Supabase, mais ne pas bloquer si erreur 403
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch {
      // En cas d'erreur (token expiré, etc.), on continue quand même
      // La session locale sera nettoyée automatiquement
    }
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  },

  updatePassword: async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  },

  updateProfile: async (userId: string, updates: { full_name?: string }) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId);

    if (error) throw error;
  },

  deleteAccount: async (_userId: string) => {
    // Appeler l'Edge Function qui supprime complètement l'utilisateur
    // (projets, profil, et entrée auth.users)
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error('Session non trouvée');
    }

    const response = await supabase.functions.invoke('delete-user', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.error) {
      throw new Error(response.error.message || 'Erreur lors de la suppression du compte');
    }

    // La session est automatiquement invalidée côté serveur
    // On nettoie la session locale
    await supabase.auth.signOut({ scope: 'local' });
  }
};
