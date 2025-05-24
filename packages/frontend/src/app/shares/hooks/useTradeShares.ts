import { useState } from 'react';
import { getBuySharesParams, getSellSharesParams } from '../contract';
import { SuiClient } from '@mysten/sui/client';

// 明确 signAndExecuteTransactionBlock 的类型
interface WalletAdapterWithSign {
  signAndExecuteTransactionBlock: (args: { transaction: unknown }) => Promise<unknown>;
}

function isWalletAdapterWithSign(adapter: unknown): adapter is WalletAdapterWithSign {
  return !!adapter && typeof (adapter as WalletAdapterWithSign).signAndExecuteTransactionBlock === 'function';
}

/**
 * Custom hook for trading shares (buy/sell) via SuiClient.
 * Handles transaction state, error, and completion callback.
 * @param onComplete - Callback when transaction is confirmed
 * @param suiClient - SuiClient instance for submitting transactions
 * @param walletAdapter - Wallet adapter object for signing
 */
export function useTradeShares(
  onComplete: () => void,
  suiClient: SuiClient | null,
  walletAdapter: unknown
) {
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Unified trade function for buy/sell
   * @param mode - 'buy' or 'sell'
   * @param subjectAddress - The subject address
   * @param amount - The amount
   * @param estimatedPrice - The estimated price (required for buy)
   */
  async function trade(
    mode: 'buy' | 'sell',
    subjectAddress: string,
    amount: string,
    estimatedPrice?: string
  ): Promise<void> {
    if (!walletAdapter) {
      setError('Wallet not connected');
      return;
    }
    if (!isWalletAdapterWithSign(walletAdapter)) {
      setError('Wallet does not support signAndExecuteTransactionBlock');
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      let tx;
      if (mode === 'buy') {
        if (!estimatedPrice) throw new Error('No estimated price');
        tx = getBuySharesParams(subjectAddress, amount, estimatedPrice);
      } else {
        tx = getSellSharesParams(subjectAddress, amount);
      }
      await walletAdapter.signAndExecuteTransactionBlock({
        transaction: tx,
      });
      setIsConfirming(true);
      onComplete();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to trade shares.');
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  }

  return {
    trade,
    isPending,
    isConfirming,
    error,
  };
} 