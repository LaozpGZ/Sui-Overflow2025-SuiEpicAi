import React, { useState } from 'react';
import { getBuySharesParams, getSellSharesParams } from '../contract';
import { SuiClient } from '@mysten/sui/client';

/**
 * Custom hook for trading shares (buy/sell) via SuiClient.
 * Handles transaction state and completion callback.
 * @param onComplete - Callback when transaction is confirmed
 * @param suiClient - SuiClient instance for submitting transactions
 * @param senderAddress - The user's wallet address
 */
export function useTradeShares(
  onComplete: () => void,
  suiClient: SuiClient | null,
  senderAddress: string | null
) {
  const [isPending, setIsPending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

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
    if (!suiClient || !senderAddress) throw new Error('Missing SuiClient or sender address');
    setIsPending(true);
    try {
      let tx;
      if (mode === 'buy') {
        if (!estimatedPrice) throw new Error('No estimated price');
        tx = getBuySharesParams(subjectAddress, amount, estimatedPrice);
      } else {
        tx = getSellSharesParams(subjectAddress, amount);
      }
      // Submit transaction
      const result = await suiClient.signAndExecuteTransactionBlock({
        transactionBlock: tx,
        signer: senderAddress,
      });
      setIsConfirming(true);
      // You can add more logic here to check transaction status
      onComplete();
    } catch (e) {
      // Handle error (optional: set error state)
    } finally {
      setIsPending(false);
      setIsConfirming(false);
    }
  }

  return {
    trade,
    isPending,
    isConfirming,
  };
} 