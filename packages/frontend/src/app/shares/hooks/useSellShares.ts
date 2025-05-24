import { useState } from 'react';
import { getSellSharesParams } from '../contract';
import { SuiClient } from '@mysten/sui/client';
import type { WalletAdapterWithSign } from '@/app/types/WalletAdapterWithSign';

/**
 * useSellShares - React hook to sell shares on Sui blockchain.
 * @param suiClient SuiClient instance for blockchain interaction.
 * @param walletAdapter Wallet adapter for signing transactions.
 * @returns { sell, isPending, error }
 */
export function useSellShares(suiClient: SuiClient, walletAdapter?: WalletAdapterWithSign) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sell(subjectAddress: string, amount: string) {
    setIsPending(true);
    setError(null);
    try {
      if (!walletAdapter) throw new Error('Wallet not connected');
      const tx = getSellSharesParams(subjectAddress, amount);
      await walletAdapter.signAndExecuteTransactionBlock({ transaction: tx });
      // Optionally, you can refetch balances or show a success toast here
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to sell shares.');
    } finally {
      setIsPending(false);
    }
  }

  return { sell, isPending, error };
} 