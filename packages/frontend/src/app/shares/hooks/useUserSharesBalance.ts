import { useEffect, useState } from 'react';
import { getSharesBalance } from '../services/suiSharesService';

/**
 * useUserSharesBalance - React hook to fetch user's shares balance for a subject.
 * @param sharesTradingObjectId Shares trading object id.
 * @param subjectAddress The subject address.
 * @param userAddress The user's wallet address.
 * @returns { balance, loading, error }
 */
export function useUserSharesBalance(
  sharesTradingObjectId: string,
  subjectAddress: string,
  userAddress: string
) {
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userAddress) return;
    setLoading(true);
    setError(null);
    getSharesBalance(sharesTradingObjectId, subjectAddress, userAddress)
      .then((result) => setBalance(result.balance))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to fetch shares balance.'))
      .finally(() => setLoading(false));
  }, [sharesTradingObjectId, subjectAddress, userAddress]);

  return { balance, loading, error };
} 