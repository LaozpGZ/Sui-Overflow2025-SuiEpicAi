import React, { useState } from 'react';
import { getBuySharesParams, getSellSharesParams } from '../contract';
import { SuiClient } from '@mysten/sui/client';

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
  walletAdapter: any // Accept wallet object
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
  ) {
    if (!suiClient || !walletAdapter) {
      setError('Missing SuiClient or wallet');
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
      // Submit transaction using wallet adapter as signer
      await suiClient.signAndExecuteTransaction({
        transaction: tx,
        signer: walletAdapter,
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