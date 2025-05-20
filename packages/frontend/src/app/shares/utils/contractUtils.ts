// contractUtils.ts
// Utility functions: Sui address validation and amount parsing

/**
 * Validate Sui address format (basic check, starts with 0x)
 */
export function validateAddress(address: string): string {
  if (!address || !address.startsWith('0x')) {
    console.warn('Basic Sui address validation failed for:', address);
  }
  return address;
}

/**
 * Parse amount string to Sui u64 (BigInt)
 */
export function parseAmount(amount: string): bigint {
  const num = Number(amount);
  if (!amount || isNaN(num) || num < 0 || !Number.isInteger(num)) return BigInt(0);
  return BigInt(num);
}

/**
 * Format price from MIST (smallest SUI unit) to human-readable SUI string.
 * @param priceMIST - The price in MIST (bigint or string or null)
 * @returns The formatted price string in SUI with 9 decimals
 */
export function formatPrice(priceMIST: bigint | string | null): string {
  if (priceMIST === null || priceMIST === undefined) return '0';
  const priceBigInt = typeof priceMIST === 'string' ? BigInt(priceMIST) : priceMIST;
  // Sui uses 9 decimal places (1 SUI = 10^9 MIST)
  return (Number(priceBigInt) / 1_000_000_000).toFixed(9);
}

/**
 * Determine if this is a first share self-purchase (buying own shares when supply is zero).
 * @param mode - Trade mode, should be 'buy' or 'sell'
 * @param subjectAddress - The subject address string
 * @param userAddress - The user's wallet address string
 * @param sharesSupply - The current shares supply (string | number | bigint)
 * @returns True if this is a first share self-purchase, otherwise false
 */
export function isFirstShareSelfPurchase(
  mode: 'buy' | 'sell',
  subjectAddress: string,
  userAddress: string,
  sharesSupply: string | number | bigint
): boolean {
  if (mode !== 'buy' || !subjectAddress || !userAddress) return false;
  const normalize = (addr: string) => addr.toLowerCase().replace(/^0x/, '');
  return (
    normalize(subjectAddress) === normalize(userAddress) &&
    BigInt(sharesSupply) === 0n
  );
}

/**
 * Normalize Sui address: lowercase and remove 0x prefix.
 * @param address - The Sui address string
 * @returns Normalized address string
 */
export function normalizeAddress(address: string): string {
  return (address || '').toLowerCase().replace(/^0x/, '');
}

/**
 * Compare two Sui addresses for equality (case-insensitive, ignore 0x prefix).
 * @param addr1 - First address
 * @param addr2 - Second address
 * @returns True if addresses are equal, otherwise false
 */
export function isSameAddress(addr1: string, addr2: string): boolean {
  return normalizeAddress(addr1) === normalizeAddress(addr2);
}

/**
 * Safely convert string, number, or bigint to BigInt. Returns 0n on failure.
 * @param value - The value to convert
 * @returns BigInt value or 0n if invalid
 */
export function toBigIntSafe(value: string | number | bigint): bigint {
  try {
    if (typeof value === 'bigint') return value;
    if (typeof value === 'number') return BigInt(value);
    if (typeof value === 'string') return BigInt(value);
  } catch {
    return 0n;
  }
  return 0n;
} 