import { useEffect, useState } from 'react';
import { suiClient } from '../services/suiSharesService';

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
        const sharesTradingObj = await suiClient.getObject({
          id: sharesTradingObjectId,
          options: { showContent: true }
        });
        const content = sharesTradingObj?.data?.content as any;
        const sharesSupplyTableId = content?.fields?.shares_supply;
        if (!sharesSupplyTableId) throw new Error('shares_supply not found');
        const supplyObj = await suiClient.getDynamicFieldObject({
          parentId: sharesSupplyTableId,
          name: { type: 'address', value: subjectAddress }
        });
        const supplyValue = (supplyObj?.data?.content as any)?.fields?.value;
        if (!cancelled) setData(Number(supplyValue));
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'Failed to fetch supply');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (subjectAddress) fetchSupply();
    return () => { cancelled = true; };
  }, [sharesTradingObjectId, subjectAddress]);

  return { data, loading, error };
} 