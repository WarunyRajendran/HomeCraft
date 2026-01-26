import { useQuery } from '@tanstack/react-query';
import { categoriesService } from '@/services/categories.service';
import { queryKeys } from '@/lib/queryKeys';

export const useCategories = () => {
  return useQuery({
    queryKey: queryKeys.categories.list(),
    queryFn: categoriesService.getAllCategories,
    staleTime: 10 * 60 * 1000,
  });
};
