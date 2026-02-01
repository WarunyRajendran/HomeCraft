import { useAuth, useProfile } from './useAuth';

export const useAdmin = () => {
  const { user, loading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile(user?.id);

  // is_admin exists in DB but may not be in auto-generated types
  const isAdmin = (profile as Record<string, unknown>)?.is_admin === true;

  return {
    user,
    isAdmin,
    isLoading: authLoading || profileLoading,
  };
};
