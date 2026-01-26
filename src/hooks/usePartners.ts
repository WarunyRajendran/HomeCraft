import { useQuery } from '@tanstack/react-query';
import { partnersService } from '@/services/partners.service';
import { queryKeys } from '@/lib/queryKeys';

export const usePartners = () => {
  return useQuery({
    queryKey: queryKeys.partners.list(),
    queryFn: partnersService.getAllPartners,
    staleTime: 10 * 60 * 1000,
  });
};
