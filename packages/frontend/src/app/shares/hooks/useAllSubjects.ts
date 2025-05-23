import { useEffect, useState } from 'react';
import { suiClient } from '../services/suiSharesService';

export function useAllSubjects(sharesTradingObjectId: string) {
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
          id: sharesTradingObjectId,
          options: { showContent: true }
        });
        const content = sharesTradingObj?.data?.content as any;
        const sharesSupplyTableId = content?.fields?.shares_supply;
        if (!sharesSupplyTableId) throw new Error('shares_supply not found');
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
  }, [sharesTradingObjectId]);

  return { data, loading, error };
} 