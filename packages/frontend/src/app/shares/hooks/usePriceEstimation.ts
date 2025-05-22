import { useEffect, useState } from 'react';
import { estimateSharePrice } from '../services/suiSharesService';
import { PriceEstimationResult } from '../../../types/shares';

/**
 * Custom hook to estimate share price for a subject and amount.
 * Returns { data, isLoading, error } for UI-friendly error and loading handling.
 */
export function usePriceEstimation(subjectAddress: string, amount: number) {
  const [data, setData] = useState<PriceEstimationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectAddress || !amount) return;
    setIsLoading(true);
    setError(null);
    estimateSharePrice(subjectAddress, amount)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to estimate share price.');
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [subjectAddress, amount]);

  return { data, isLoading, error };
} 