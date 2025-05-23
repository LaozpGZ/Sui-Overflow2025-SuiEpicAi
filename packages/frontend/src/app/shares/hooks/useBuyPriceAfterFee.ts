import { useEffect, useState } from 'react';
import { suiClient } from '../services/suiSharesService';

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
        const resp = await suiClient.callMoveFunction({
          package: packageId,
          module: 'shares_trading',
          function: 'get_buy_price_after_fee',
          arguments: [
            sharesTradingObjectId,
            subjectAddress,
            amount.toString()
          ],
        });
        if (!cancelled) setData(Number(resp.results[0]));
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to fetch buy price');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (subjectAddress && amount > 0) fetchPrice();
    return () => { cancelled = true; };
  }, [packageId, sharesTradingObjectId, subjectAddress, amount]);

  return { data, loading, error };
} 