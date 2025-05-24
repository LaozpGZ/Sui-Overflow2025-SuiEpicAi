import { useState, useEffect } from 'react';
import { Share } from '../types';
import { getSharesList, getShareDetail } from '../services/suiSharesService';

export function useShares(
  sharesTradingObjectId: string,
  subjectAddress?: string
) {
  const [shares, setShares] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = async () => {
    setIsLoading(true);
    try {
      let data;
      if (subjectAddress) {
        data = await getShareDetail(sharesTradingObjectId, subjectAddress);
        setShares(data ? [data] : []);
      } else {
        data = await getSharesList(sharesTradingObjectId);
        setShares(data);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get shares from chain');
      setShares([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharesTradingObjectId, subjectAddress]);

  return { shares, isLoading, error, refetch: fetchShares };
} 