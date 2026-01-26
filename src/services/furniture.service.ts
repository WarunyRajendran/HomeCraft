import { supabase } from '@/integrations/supabase/client';
import { validateAndSanitizeSearch, UUIDSchema } from '@/lib/validation';

export const furnitureService = {
  getAllFurniture: async () => {
    const { data, error } = await supabase
      .from('furniture')
      .select('*, furniture_categories(*), partners(*)')
      .eq('is_active', true)
      .order('name')
      .limit(100); // Limite pour éviter les requêtes trop grandes

    if (error) throw error;
    return data;
  },

  getFurnitureByCategory: async (categoryId: string) => {
    // Valider l'UUID de la catégorie
    UUIDSchema.parse(categoryId);

    const { data, error } = await supabase
      .from('furniture')
      .select('*, furniture_categories(*), partners(*)')
      .eq('is_active', true)
      .eq('category_id', categoryId)
      .order('name')
      .limit(100);

    if (error) throw error;
    return data;
  },

  searchFurniture: async (query: string) => {
    // Valider et sanitizer la requête de recherche
    const sanitizedQuery = validateAndSanitizeSearch(query);

    const { data, error } = await supabase
      .from('furniture')
      .select('*, furniture_categories(*), partners(*)')
      .eq('is_active', true)
      .ilike('name', `%${sanitizedQuery}%`)
      .order('name')
      .limit(50); // Limite plus stricte pour les recherches

    if (error) throw error;
    return data;
  }
};
