import { useEffect, useState } from 'react';
import { fetchSharesBalance } from '../contract';
import { NetworkContractConfig, SharesBalanceResult } from '../types';

export function useSharesBalance(
  config: NetworkContractConfig | null,
  subjectAddress: string,
  userAddress: string
): SharesBalanceResult | null {
  const [result, setResult] = useState<SharesBalanceResult | null>(null);

  useEffect(() => {
    if (!config || !subjectAddress || !userAddress) return;
    fetchSharesBalance(config, subjectAddress, userAddress).then(setResult);
  }, [config, subjectAddress, userAddress]);

  return result;
} 