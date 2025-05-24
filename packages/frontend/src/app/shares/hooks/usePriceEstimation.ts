import { useEffect, useState } from 'react';
import { estimateSharePrice } from '../services/suiSharesService';

/**
 * usePriceEstimation - React hook to estimate buy/sell price for shares.
 * @param packageId Sui contract package id.
 * @param sharesTradingObjectId Shares trading object id.
 * @param subjectAddress The subject address.
 * @param amount The amount to buy or sell.
 * @returns { price, loading, error }
 */
export function usePriceEstimation(
  packageId: string,
  sharesTradingObjectId: string,
  subjectAddress: string,
  amount: number
) {
  const [price, setPrice] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectAddress || !amount) return;
    setLoading(true);
    setError(null);
    estimateSharePrice(packageId, sharesTradingObjectId, subjectAddress, amount)
      .then((result) => setPrice(result.price))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to estimate price.'))
      .finally(() => setLoading(false));
  }, [packageId, sharesTradingObjectId, subjectAddress, amount]);

  return { price, loading, error };
} 