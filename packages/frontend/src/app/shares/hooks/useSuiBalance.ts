import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { getSuiBalance } from '../services/suiSharesService';

/**
 * useSuiBalance - React hook to query the current user's SUI balance.
 * @param address Optional, override the current wallet address.
 * @returns { balance, loading, error }
 */
export function useSuiBalance(address?: string) {
  const currentAccount = useCurrentAccount();
  const [balance, setBalance] = useState<bigint>(0n);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const owner = address || currentAccount?.address;
    if (!owner) return;
    setLoading(true);
    setError(null);
    async function fetchBalance() {
      try {
        const total = await getSuiBalance(owner as string);
        setBalance(total);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to fetch SUI balance.');
        setBalance(0n);
      } finally {
        setLoading(false);
      }
    }
    fetchBalance();
  }, [address, currentAccount]);

  return { balance, loading, error };
} 