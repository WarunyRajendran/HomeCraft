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

  resetPasswordForEmail: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
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

    // Rafraîchir la session pour avoir un token valide
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();

    if (sessionError || !session) {
      console.error('Session refresh error:', sessionError);
      throw new Error('Session expirée, veuillez vous reconnecter');
    }

    console.log('Token refreshed, calling delete-user function...');

    const { data, error } = await supabase.functions.invoke('delete-user', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Delete account error:', error, data);
      const errorMessage = data?.error || error.message || 'Erreur lors de la suppression du compte';
      throw new Error(errorMessage);
    }

    // La session est automatiquement invalidée côté serveur
    // On nettoie la session locale
    await supabase.auth.signOut({ scope: 'local' });
  }
};
