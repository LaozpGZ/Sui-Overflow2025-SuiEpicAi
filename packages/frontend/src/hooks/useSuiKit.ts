import { useMemo } from 'react';
import { SuiKit, SuiKitConfig } from '@suiware/kit';

export function useSuiKit(config?: Partial<SuiKitConfig>) {
  const defaultConfig: SuiKitConfig = {
    networkType: 'testnet', 
    ...config,
  };
  const suiKit = useMemo(() => new SuiKit(defaultConfig), [JSON.stringify(defaultConfig)]);
  return suiKit;
} 