import { supabase } from '@/integrations/supabase/client';

export const partnersService = {
  getAllPartners: async () => {
    const { data, error } = await supabase
      .from('partners')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data;
  }
};
