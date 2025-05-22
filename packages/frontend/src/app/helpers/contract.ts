import { parseEther } from 'viem';
import { WEB3_CONFIG } from '@/app/config/config';

// Contract configuration
export const CONTRACT_ADDRESS = WEB3_CONFIG.CONTRACT_ADDRESS as `0x${string}`;
export const CONTRACT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'sharesSubject', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'buyShares',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'sharesSubject', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'sellShares',
    outputs: [],
    stateMutability: 'payable',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'sharesSubject', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'getBuyPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'sharesSubject', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'getSellPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'sharesSubject', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'getBuyPriceAfterFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: 'sharesSubject', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'getSellPriceAfterFee',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { internalType: 'address', name: '', type: 'address' },
      { internalType: 'address', name: '', type: 'address' }
    ],
    name: 'sharesBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ internalType: 'address', name: '', type: 'address' }],
    name: 'sharesSupply',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const;

// Contract function names as literal types
export type ContractFunctionName = 'buyShares' | 'sellShares' | 'getBuyPriceAfterFee' | 'getSellPriceAfterFee';

// Function to format price from wei to human readable format
export function formatPrice(priceWei: bigint | string | null): string {
  if (!priceWei) return '0';
  
  const priceBigInt = typeof priceWei === 'string' ? BigInt(priceWei) : priceWei;
  return (Number(priceBigInt) / 10**18).toFixed(6);
}

// Function to validate and convert address to correct format
export function validateAddress(address: string): `0x${string}` {
  let formattedAddress = address;
  if (!address) {
    throw new Error('Address cannot be empty');
  }
  if (!address.startsWith('0x')) {
    formattedAddress = `0x${address}`;
  }
  return formattedAddress as `0x${string}`;
}

// Function to parse amount to BigInt
export function parseAmount(amount: string): bigint {
  if (!amount || isNaN(Number(amount))) return BigInt(0);
  return BigInt(amount);
}

// Contract interaction parameters for buy operation
export function getBuySharesParams(subjectAddress: string, amount: string, estimatedPrice: string) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'buyShares' as const,
    args: [validateAddress(subjectAddress), parseAmount(amount)] as const as readonly [`0x${string}`, bigint],
    value: BigInt(estimatedPrice),
  };
}

// Contract interaction parameters for sell operation
export function getSellSharesParams(subjectAddress: string, amount: string) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'sellShares' as const,
    args: [validateAddress(subjectAddress), parseAmount(amount)] as const as readonly [`0x${string}`, bigint],
  };
}

// Contract read parameters for price estimation
export function getPriceEstimationParams(mode: 'buy' | 'sell', subjectAddress: string, amount: string) {
  const validAddress = subjectAddress ? validateAddress(subjectAddress) : '0x0000000000000000000000000000000000000000' as `0x${string}`;
  const functionName = mode === 'buy' ? 'getBuyPriceAfterFee' : 'getSellPriceAfterFee';
  
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: functionName as ContractFunctionName,
    args: [validAddress, parseAmount(amount)],
  };
}

// Contract read parameters for getting share balance
export function getSharesBalanceParams(userAddress: string, subjectAddress: string) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'sharesBalance',
    args: [validateAddress(subjectAddress), validateAddress(userAddress)],
  };
}

// Contract read parameters for getting total shares supply
export function getSharesSupplyParams(subjectAddress: string) {
  return {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'sharesSupply',
    args: [validateAddress(subjectAddress)],
  };
} 