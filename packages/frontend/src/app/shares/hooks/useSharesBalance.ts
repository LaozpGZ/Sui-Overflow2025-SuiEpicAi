import { useEffect, useState } from 'react';
import { getSharesBalance } from '../services/suiSharesService';
import { SharesBalanceResult } from '../../../types/shares';

/**
 * Custom hook to fetch shares balance for a user and subject address.
 * Returns { data, isLoading, error } for UI-friendly error and loading handling.
 */
export function useSharesBalance(
  sharesTradingObjectId: string,
  subjectAddress: string,
  userAddress: string
) {
  const [data, setData] = useState<SharesBalanceResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectAddress || !userAddress) return;
    setIsLoading(true);
    setError(null);
    getSharesBalance(sharesTradingObjectId, subjectAddress, userAddress)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch shares balance.');
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [sharesTradingObjectId, subjectAddress, userAddress]);

  return { data, isLoading, error };
} 