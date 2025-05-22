import { useEffect, useState } from 'react';
import { getSharesSupply } from '../services/suiSharesService';
import { SharesSupplyResult } from '../types';

export function useSharesSupply(subjectAddress: string): SharesSupplyResult | null {
  const [result, setResult] = useState<SharesSupplyResult | null>(null);

  useEffect(() => {
    if (!subjectAddress) return;
    getSharesSupply(subjectAddress).then(setResult);
  }, [subjectAddress]);

  return result;
} 