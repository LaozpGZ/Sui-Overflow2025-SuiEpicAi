import { Share } from '../types';

/**
 * Validate trade form input for buy/sell shares.
 * @param mode - 'buy' or 'sell'
 * @param subjectAddress - The subject address string
 * @param amount - The amount string
 * @param share - The user's share object (optional)
 * @returns Error message string if invalid, otherwise null
 */
export function validateTradeForm(
  mode: 'buy' | 'sell',
  subjectAddress: string,
  amount: string,
  share?: Share | null
): string | null {
  if (!subjectAddress) {
    return 'Please enter Subject address';
  }
  if (!amount || Number(amount) <= 0) {
    return 'Please enter a valid amount';
  }
  if (
    mode === 'sell' &&
    share &&
    Number(amount) > Number(share.shares_amount)
  ) {
    return 'Sell amount cannot exceed your balance';
  }
  return null;
} 