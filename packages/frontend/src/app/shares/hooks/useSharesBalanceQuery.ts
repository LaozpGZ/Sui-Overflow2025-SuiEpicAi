import { useQuery } from '@tanstack/react-query';
import { getSharesBalance } from '../services/suiSharesService';
import { SharesBalanceResult } from '../../../types/shares';

/**
 * Query shares balance for a given subjectAddress and userAddress
 */
export function useSharesBalanceQuery(subjectAddress: string, userAddress: string) {
  return useQuery<SharesBalanceResult, Error>({
    queryKey: ['sharesBalance', subjectAddress, userAddress],
    queryFn: () => getSharesBalance(subjectAddress, userAddress),
    enabled: !!subjectAddress && !!userAddress,
    staleTime: 30_000,
  });
} 