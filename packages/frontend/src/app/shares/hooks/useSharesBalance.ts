import { useEffect, useState } from 'react';
import { getSharesBalance } from '../services/suiSharesService';
import { SharesBalanceResult } from '../types';

export function useSharesBalance(subjectAddress: string, userAddress: string): SharesBalanceResult | null {
  const [result, setResult] = useState<SharesBalanceResult | null>(null);

  useEffect(() => {
    if (!subjectAddress || !userAddress) return;
    getSharesBalance(subjectAddress, userAddress).then(setResult);
  }, [subjectAddress, userAddress]);

  return result;
} 