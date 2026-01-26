import { useQuery } from '@tanstack/react-query';
import { furnitureService } from '@/services/furniture.service';
import { queryKeys } from '@/lib/queryKeys';

export const useFurnitureList = () => {
  return useQuery({
    queryKey: queryKeys.furniture.list(),
    queryFn: furnitureService.getAllFurniture,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useFurnitureByCategory = (categoryId: string | null) => {
  return useQuery({
    queryKey: queryKeys.furniture.byCategory(categoryId || 'all'),
    queryFn: () => categoryId
      ? furnitureService.getFurnitureByCategory(categoryId)
      : furnitureService.getAllFurniture(),
    enabled: true,
  });
};

export const useFurnitureSearch = (query: string) => {
  return useQuery({
    queryKey: queryKeys.furniture.search(query),
    queryFn: () => furnitureService.searchFurniture(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
};
