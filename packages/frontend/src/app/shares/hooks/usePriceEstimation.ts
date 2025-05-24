import { useEffect, useState } from 'react';
import { estimateSharePrice } from '../services/suiSharesService';
import { PriceEstimationResult } from '../../../types/shares';

/**
 * Custom hook to estimate share price for a subject and amount.
 * Returns { data, isLoading, error } for UI-friendly error and loading handling.
 */
export function usePriceEstimation(
  packageId: string,
  sharesTradingObjectId: string,
  subjectAddress: string,
  amount: number
) {
  const [data, setData] = useState<PriceEstimationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectAddress || !amount) return;
    setIsLoading(true);
    setError(null);
    estimateSharePrice(packageId, sharesTradingObjectId, subjectAddress, amount)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to estimate share price.');
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [packageId, sharesTradingObjectId, subjectAddress, amount]);

  return { data, isLoading, error };
} 