import { useEffect, useState } from 'react';
import { getSharesSupply } from '../services/suiSharesService';

/**
 * useSharesSupply - React hook to fetch total supply of shares for a subject.
 * @param sharesTradingObjectId The trading object id.
 * @param subjectAddress The subject address.
 * @returns { supply, loading, error }
 */
export function useSharesSupply(sharesTradingObjectId: string, subjectAddress: string) {
  const [supply, setSupply] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getSharesSupply(sharesTradingObjectId, subjectAddress)
      .then((result) => setSupply(result.supply))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch supply.'))
      .finally(() => setLoading(false));
  }, [sharesTradingObjectId, subjectAddress]);

  return { supply, loading, error };
} 