import { useState, useEffect } from 'react';
import { Share } from '../types';
import { API_CONFIG } from '@/config/api';

export function useShares(walletAddress?: string) {
  const [shares, setShares] = useState<Share[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShares = async () => {
    if (!walletAddress) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_CONFIG.SERVER_API}/users/${walletAddress}/shares`);
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      const data = await response.json();
      setShares(data.shares);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get shares');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) fetchShares();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  return { shares, isLoading, error, refetch: fetchShares };
} 