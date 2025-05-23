import { useEffect, useState } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';

/**
 * useSuiBalance - React hook to query the current user's SUI balance.
 * @param address Optional, override the current wallet address.
 * @returns { balance, loading, error }
 */
export function useSuiBalance(address?: string) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const owner = address || currentAccount?.address;
    if (!owner || !suiClient) return;
    setLoading(true);
    setError(null);
    async function fetchBalance() {
      try {
        const coins = await suiClient.getCoins({
          owner: owner as string,
          coinType: '0x2::sui::SUI',
        });
        const total = coins.data.reduce((sum: bigint, coin: any) => sum + BigInt(coin.balance), 0n);
        setBalance(total);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch SUI balance.');
        setBalance(0n);
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, [address, currentAccount, suiClient]);

  return { balance, loading, error };
} 