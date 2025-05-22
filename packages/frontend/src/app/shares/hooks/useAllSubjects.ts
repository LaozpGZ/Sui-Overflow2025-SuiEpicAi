import { useEffect, useState } from 'react';
import { SuiClient } from '@mysten/sui/client';

const SHARES_TRADING_OBJECT_ID = '0xd08d2d8f0c7df418dbc038e6a03c7e6e19ca73b49bf1bd279c4440d511a65edd';

export function useAllSubjects(suiClient: SuiClient) {
  const [data, setData] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchSubjects() {
      setLoading(true);
      setError(null);
      try {
        const sharesTradingObj = await suiClient.getObject({
          id: SHARES_TRADING_OBJECT_ID,
          options: { showContent: true }
        });
        const sharesSupplyTableId = sharesTradingObj.data.content.fields.shares_supply;
        const subjects = await suiClient.getDynamicFields({ parentId: sharesSupplyTableId });
        if (!cancelled) setData(subjects.data.map((item: any) => item.name.value));
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to fetch subjects');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchSubjects();
    return () => { cancelled = true; };
  }, [suiClient]);

  return { data, loading, error };
} 