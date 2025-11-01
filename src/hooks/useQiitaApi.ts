import { useQuery } from '@tanstack/react-query';
import { qiitaApi } from '@/services/qiitaApi';
import { useAppContext } from '@/stores/AppContext';

export const useQiitaItems = () => {
  const {
    currentPage: page,
    itemsPerPage: perPage,
    searchQuery,
  } = useAppContext();

  return useQuery({
    queryKey: ['qiita-items', page, perPage, searchQuery],
    queryFn: () => {
      // if (isAuthenticated) {
      //   return qiitaApi.getAuthenticatedUserItems(page, perPage);
      // }
      return qiitaApi.getItems(page, perPage, searchQuery);
    },
    staleTime: 5 * 60 * 1000, // 5分
    gcTime: 10 * 60 * 1000, // 10分
  });
};

export const useQiitaItem = (itemId: string) => {
  return useQuery({
    queryKey: ['qiita-item', itemId],
    queryFn: () => qiitaApi.getItem(itemId),
    enabled: !!itemId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
