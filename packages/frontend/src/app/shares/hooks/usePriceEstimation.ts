import { useMemo } from 'react';
import { getPriceEstimationParams } from '../contract';
import { NetworkContractConfig, TradeMode, PriceEstimationResult } from '../types';
import { useSuiClientQuery } from '@mysten/dapp-kit';

export function usePriceEstimation(
  config: NetworkContractConfig | null,
  mode: TradeMode,
  subjectAddress: string,
  amount: string
): PriceEstimationResult | null {
  const params = useMemo(() => {
    if (!config || !subjectAddress || !amount) return null;
    return getPriceEstimationParams(config, mode, subjectAddress, amount);
  }, [config, mode, subjectAddress, amount]);

  const { data } = useSuiClientQuery('callMoveFunction', params ?? undefined);

  if (!data || !Array.isArray(data) || data.length === 0) return null;
  const priceRaw = data[0] as string | number | bigint;
  return { price: BigInt(priceRaw) };
} 