import { useQuery } from '@tanstack/react-query';
import { getSharesBalance } from '../services/suiSharesService';
import { SharesBalanceResult } from '../../../types/shares';
import { SuiClient } from '@mysten/sui/client';

/**
 * Query shares balance for a given subjectAddress and userAddress
 */
export function useSharesBalanceQuery(
  sharesTradingObjectId: string,
  subjectAddress: string,
  userAddress: string
) {
  return useQuery<SharesBalanceResult, Error>({
    queryKey: ['sharesBalance', subjectAddress, userAddress],
    queryFn: () => getSharesBalance(sharesTradingObjectId, subjectAddress, userAddress),
    enabled: !!subjectAddress && !!userAddress,
    staleTime: 30_000,
  });
} 