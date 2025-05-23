import { useQuery } from '@tanstack/react-query';
import { getSharesList, getShareDetail } from '../services/suiSharesService';
import { Share } from '../../../types/shares';
import { SuiClient } from '@mysten/sui/client';

/**
 * Get shares list or single share detail
 * @param sharesTradingObjectId The trading object ID
 * @param subjectAddress Optional, if provided will only query single share
 */
export function useSharesQuery(
  sharesTradingObjectId: string,
  subjectAddress?: string
) {
  return useQuery<Share[] | Share | null, Error>({
    queryKey: subjectAddress ? ['shares', subjectAddress] : ['shares'],
    queryFn: async () => {
      if (subjectAddress) {
        const data = await getShareDetail(sharesTradingObjectId, subjectAddress);
        return data ? [data] : [];
      } else {
        return await getSharesList(sharesTradingObjectId);
      }
    },
    staleTime: 30_000, // Don't refetch for 30 seconds
  });
} 