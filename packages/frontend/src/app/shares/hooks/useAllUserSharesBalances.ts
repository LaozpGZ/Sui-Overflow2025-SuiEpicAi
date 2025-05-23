import { useMemo } from 'react';
import { useUserSharesBalance } from './useUserSharesBalance';
import { SuiClient } from '@mysten/sui/client';

export function useAllUserSharesBalances(
  sharesTradingObjectId: string,
  subjectAddresses: string[],
  walletAddress: string
) {
  // Returns an array where each element is { subject, sharesAmount, loading, error }
  return useMemo(
    () =>
      subjectAddresses.map(subject => {
        const { data, loading, error } = useUserSharesBalance(sharesTradingObjectId, subject, walletAddress);
        return { subject, sharesAmount: data, loading, error };
      }),
    [sharesTradingObjectId, subjectAddresses, walletAddress]
  );
} 