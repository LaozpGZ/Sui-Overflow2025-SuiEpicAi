import { useEffect, useState } from 'react';
import { fetchSharesSupply } from '../contract';
import { NetworkContractConfig, SharesSupplyResult } from '../types';

export function useSharesSupply(config: NetworkContractConfig | null, subjectAddress: string): SharesSupplyResult | null {
  const [result, setResult] = useState<SharesSupplyResult | null>(null);

  useEffect(() => {
    if (!config || !subjectAddress) return;
    fetchSharesSupply(config, subjectAddress).then(setResult);
  }, [config, subjectAddress]);

  return result;
} 