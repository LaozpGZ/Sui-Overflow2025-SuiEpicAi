import { useEffect, useState } from 'react';
import { estimateSharePrice } from '../services/suiSharesService';
import { PriceEstimationResult, TradeMode } from '../types';

export function usePriceEstimation(subjectAddress: string, amount: number): PriceEstimationResult | null {
  const [result, setResult] = useState<PriceEstimationResult | null>(null);

  useEffect(() => {
    if (!subjectAddress || !amount) return;
    estimateSharePrice(subjectAddress, amount).then(setResult);
  }, [subjectAddress, amount]);

  return result;
} 