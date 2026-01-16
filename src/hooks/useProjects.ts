import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsService } from '@/services/projects.service';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from './useAuth';

export const useUserProjects = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.list(user?.id || ''),
    queryFn: () => projectsService.getUserProjects(user!.id),
    enabled: !!user,
  });
};

export const useProject = (projectId: string | undefined) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: queryKeys.projects.detail(projectId || ''),
    queryFn: () => projectsService.getProjectById(projectId!, user!.id),
    enabled: !!projectId && !!user,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(user?.id || '')
      });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) =>
      projectsService.updateProject(id, data, user!.id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.detail(variables.id)
      });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (projectId: string) => projectsService.deleteProject(projectId, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.list(user?.id || '')
      });
    },
  });
};
