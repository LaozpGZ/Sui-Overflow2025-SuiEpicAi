import { useQuery } from '@tanstack/react-query';
import { getSharesBalance } from '../services/suiSharesService';
import { SharesBalanceResult } from '../../../types/shares';

/**
 * 查询某个 subjectAddress 和 userAddress 的 shares balance
 */
export function useSharesBalanceQuery(subjectAddress: string, userAddress: string) {
  return useQuery<SharesBalanceResult, Error>({
    queryKey: ['sharesBalance', subjectAddress, userAddress],
    queryFn: () => getSharesBalance(subjectAddress, userAddress),
    enabled: !!subjectAddress && !!userAddress,
    staleTime: 30_000,
  });
} 