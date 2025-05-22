import { useEffect, useState } from 'react';
import { SuiClient } from '@mysten/sui/client';

const SHARES_TRADING_OBJECT_ID = '0xd08d2d8f0c7df418dbc038e6a03c7e6e19ca73b49bf1bd279c4440d511a65edd';

export function useBuyPriceAfterFee(
  suiClient: SuiClient,
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
          package: SHARES_TRADING_OBJECT_ID,
          module: 'shares_trading',
          function: 'get_buy_price_after_fee',
          arguments: [
            SHARES_TRADING_OBJECT_ID,
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
  }, [suiClient, subjectAddress, amount]);

  return { data, loading, error };
} 