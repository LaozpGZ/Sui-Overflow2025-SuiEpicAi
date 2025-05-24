import { useEffect, useState } from 'react';
import { getSubjectSupply } from '../services/suiSharesService';

export function useSubjectSupply(
  sharesTradingObjectId: string,
  subjectAddress: string
) {
  const [data, setData] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSupply() {
      setLoading(true);
      setError(null);
      try {
        const supply = await getSubjectSupply(sharesTradingObjectId, subjectAddress);
        if (!cancelled) setData(supply);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch supply');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (subjectAddress) fetchSupply();
    return () => { cancelled = true; };
  }, [sharesTradingObjectId, subjectAddress]);

  return { data, loading, error };
} 