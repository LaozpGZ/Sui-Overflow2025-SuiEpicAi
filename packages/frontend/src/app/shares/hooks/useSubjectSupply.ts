import { useEffect, useState } from 'react';
import { SuiClient } from '@mysten/sui/client';

const SHARES_TRADING_OBJECT_ID = '0xd08d2d8f0c7df418dbc038e6a03c7e6e19ca73b49bf1bd279c4440d511a65edd';

export function useSubjectSupply(suiClient: SuiClient, subjectAddress: string) {
  const [data, setData] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSupply() {
      setLoading(true);
      setError(null);
      try {
        const sharesTradingObj = await suiClient.getObject({
          id: SHARES_TRADING_OBJECT_ID,
          options: { showContent: true }
        });
        const sharesSupplyTableId = sharesTradingObj.data.content.fields.shares_supply;
        const supplyObj = await suiClient.getDynamicFieldObject({
          parentId: sharesSupplyTableId,
          name: { type: 'address', value: subjectAddress }
        });
        if (!cancelled) setData(Number(supplyObj.data.content.fields.value));
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to fetch supply');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (subjectAddress) fetchSupply();
    return () => { cancelled = true; };
  }, [suiClient, subjectAddress]);

  return { data, loading, error };
} 