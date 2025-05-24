import { useState } from 'react';
import { getBuySharesParams } from '../contract';
import { SuiClient } from '@mysten/sui/client';

/**
 * useBuyShares - React hook to buy shares on Sui blockchain.
 * @param suiClient SuiClient instance.
 * @param walletAdapter Wallet adapter for signing transactions.
 * @returns { buy, isPending, error }
 */
export function useBuyShares(suiClient: SuiClient, walletAdapter: any) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function buy(subjectAddress: string, amount: string, estimatedPrice: string) {
    setIsPending(true);
    setError(null);
    try {
      const tx = getBuySharesParams(subjectAddress, amount, estimatedPrice);
      await walletAdapter.signAndExecuteTransactionBlock({ transaction: tx });
      // Optionally, you can refetch balances or show a success toast here
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to buy shares.');
    } finally {
      setIsPending(false);
    }
  }

  return { buy, isPending, error };
} 