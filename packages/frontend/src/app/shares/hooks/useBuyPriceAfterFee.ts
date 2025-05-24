import { useEffect, useState } from 'react';
import { getBuyPriceAfterFee } from '../services/suiSharesService';

export function useBuyPriceAfterFee(
  packageId: string,
  sharesTradingObjectId: string,
  subjectAddress: string,
  amount: number
) {
  const [data, setData] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPrice() {
      setLoading(true);
      setError(null);
      try {
        const price = await getBuyPriceAfterFee(packageId, sharesTradingObjectId, subjectAddress, amount);
        if (!cancelled) setData(price);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to fetch buy price');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (subjectAddress && amount > 0) fetchPrice();
    return () => { cancelled = true; };
  }, [packageId, sharesTradingObjectId, subjectAddress, amount]);

  return { data, loading, error };
} 