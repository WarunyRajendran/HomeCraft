import { supabase } from '@/integrations/supabase/client';
import { ProjectCreateSchema, ProjectUpdateSchema, UUIDSchema } from '@/lib/validation';

export const projectsService = {
  getUserProjects: async (userId: string) => {
    // Valider l'UUID de l'utilisateur
    UUIDSchema.parse(userId);

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  getProjectById: async (projectId: string, userId: string) => {
    // Valider les UUIDs
    UUIDSchema.parse(projectId);
    UUIDSchema.parse(userId);

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .or(`user_id.eq.${userId},is_public.eq.true`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Projet introuvable ou accès non autorisé');
      }
      throw error;
    }
    return data;
  },

  createProject: async (projectData: unknown) => {
    // Valider et sanitizer les données
    const validated = ProjectCreateSchema.parse(projectData);

    const { data, error } = await supabase
      .from('projects')
      .insert([validated])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  updateProject: async (projectId: string, projectData: unknown, userId: string) => {
    // Valider les UUIDs
    UUIDSchema.parse(projectId);
    UUIDSchema.parse(userId);

    // Valider les données partielles (pas besoin de tous les champs pour update)
    const validated = ProjectUpdateSchema.parse(projectData);

    const { data, error } = await supabase
      .from('projects')
      .update(validated)
      .eq('id', projectId)
      .eq('user_id', userId) // Vérification explicite de l'ownership
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('Projet introuvable ou accès non autorisé');
      }
      throw error;
    }
    return data;
  },

  deleteProject: async (projectId: string, userId: string) => {
    // Valider les UUIDs
    UUIDSchema.parse(projectId);
    UUIDSchema.parse(userId);

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)
      .eq('user_id', userId); // Vérification explicite de l'ownership

    if (error) throw error;
  }
};
