import { useQuery } from '@tanstack/react-query';
import { estimateSharePrice } from '../services/suiSharesService';
import { PriceEstimationResult } from '../../../types/shares';
import { SuiClient } from '@mysten/sui/client';

/**
 * Query price estimation for buying amount of shares for subjectAddress
 */
export function usePriceEstimationQuery(
  packageId: string,
  sharesTradingObjectId: string,
  subjectAddress: string,
  amount: number
) {
  return useQuery<PriceEstimationResult, Error>({
    queryKey: ['priceEstimation', subjectAddress, amount],
    queryFn: () => estimateSharePrice(packageId, sharesTradingObjectId, subjectAddress, amount),
    enabled: !!subjectAddress && amount > 0,
    staleTime: 30_000,
  });
} 