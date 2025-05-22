import { useEffect, useState } from 'react';
import { SuiClient } from '@mysten/sui/client';

const SHARES_TRADING_OBJECT_ID = '0xd08d2d8f0c7df418dbc038e6a03c7e6e19ca73b49bf1bd279c4440d511a65edd';

export function useUserSharesBalance(
  suiClient: SuiClient,
  subjectAddress: string,
  userAddress: string
) {
  const [data, setData] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchBalance() {
      setLoading(true);
      setError(null);
      try {
        const sharesTradingObj = await suiClient.getObject({
          id: SHARES_TRADING_OBJECT_ID,
          options: { showContent: true }
        });
        const sharesBalanceTableId = sharesTradingObj.data.content.fields.shares_balance;
        const subjectBalancesObj = await suiClient.getDynamicFieldObject({
          parentId: sharesBalanceTableId,
          name: { type: 'address', value: subjectAddress }
        });
        const userBalanceTableId = subjectBalancesObj.data.content.fields.value;
        const userBalanceObj = await suiClient.getDynamicFieldObject({
          parentId: userBalanceTableId,
          name: { type: 'address', value: userAddress }
        });
        if (!cancelled) setData(Number(userBalanceObj.data.content.fields.value));
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to fetch user shares balance');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (subjectAddress && userAddress) fetchBalance();
    return () => { cancelled = true; };
  }, [suiClient, subjectAddress, userAddress]);

  return { data, loading, error };
} 