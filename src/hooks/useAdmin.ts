import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface AdminProfile {
  is_admin: boolean;
}

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['admin-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching admin status:', error);
        return null;
      }

      return data as AdminProfile;
    },
    enabled: !!user?.id,
  });

  return {
    user,
    isAdmin: profile?.is_admin ?? false,
    isLoading: authLoading || profileLoading,
  };
};
