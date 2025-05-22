import { useQuery } from '@tanstack/react-query';
import { estimateSharePrice } from '../services/suiSharesService';
import { PriceEstimationResult } from '../../../types/shares';

/**
 * 查询 subjectAddress 买入 amount 的价格预估
 */
export function usePriceEstimationQuery(subjectAddress: string, amount: number) {
  return useQuery<PriceEstimationResult, Error>({
    queryKey: ['priceEstimation', subjectAddress, amount],
    queryFn: () => estimateSharePrice(subjectAddress, amount),
    enabled: !!subjectAddress && amount > 0,
    staleTime: 30_000,
  });
} 