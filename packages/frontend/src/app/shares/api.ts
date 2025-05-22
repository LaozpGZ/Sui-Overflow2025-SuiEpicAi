import { API_CONFIG } from '@/config/api';
import { Share } from '@/types/shares';

/**
 * Fetch all shares of a user on a specific blockchain
 * @param userAddress User address
 * @param chainType Blockchain type, default is 'sui'
 */
export async function fetchUserShares(userAddress: string, chainType: string = 'sui'): Promise<Share[]> {
  if (!userAddress) return [];
  const res = await fetch(`${API_CONFIG.SERVER_API}/users/${userAddress}/shares/${chainType}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json();
  return data.shares || [];
} 