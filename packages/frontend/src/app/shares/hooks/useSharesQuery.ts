import { useQuery } from '@tanstack/react-query';
import { getSharesList, getShareDetail } from '../services/suiSharesService';
import { Share } from '../../../types/shares';

/**
 * 获取 shares 列表或单个 share 详情
 * @param subjectAddress 可选，传入则只查单个 share
 */
export function useSharesQuery(subjectAddress?: string) {
  return useQuery<Share[] | Share | null, Error>({
    queryKey: subjectAddress ? ['shares', subjectAddress] : ['shares'],
    queryFn: async () => {
      if (subjectAddress) {
        const data = await getShareDetail(subjectAddress);
        return data ? [data] : [];
      } else {
        return await getSharesList();
      }
    },
    staleTime: 30_000, // 30秒内不重新请求
  });
} 