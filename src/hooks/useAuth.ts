import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authService } from '@/services/auth.service';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error getting session:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { user, loading };
};

export const useProfile = (userId: string | undefined) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: () => authService.getProfile(userId!),
    enabled: !!userId,
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: ({ email, password, fullName }: {
      email: string;
      password: string;
      fullName: string;
    }) => authService.signUp(email, password, fullName),
  });
};

export const useSignIn = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signIn(email, password),
  });
};

export const useSignOut = () => {
  return useMutation({
    mutationFn: authService.signOut,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resetPasswordForEmail(email),
  });
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (newPassword: string) => authService.updatePassword(newPassword),
  });
};
