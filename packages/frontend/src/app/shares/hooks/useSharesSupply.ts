import { useEffect, useState } from 'react';
import { getSharesSupply } from '../services/suiSharesService';
import { SharesSupplyResult } from '../../../types/shares';

/**
 * Custom hook to fetch shares supply for a subject address.
 * Returns { data, isLoading, error } for UI-friendly error and loading handling.
 */
export function useSharesSupply(
  sharesTradingObjectId: string,
  subjectAddress: string
) {
  const [data, setData] = useState<SharesSupplyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!subjectAddress) return;
    setIsLoading(true);
    setError(null);
    getSharesSupply(sharesTradingObjectId, subjectAddress)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch shares supply.');
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [sharesTradingObjectId, subjectAddress]);

  return { data, isLoading, error };
} 