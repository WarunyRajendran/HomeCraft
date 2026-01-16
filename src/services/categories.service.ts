import { supabase } from '@/integrations/supabase/client';

export const categoriesService = {
  getAllCategories: async () => {
    const { data, error } = await supabase
      .from('furniture_categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  }
};
