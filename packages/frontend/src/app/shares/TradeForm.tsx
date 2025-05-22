'use client';

import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { 
  getPriceEstimationParams, 
  getBuySharesParams, 
  getSellSharesParams
} from './contract';
import { formatPrice, isFirstShareSelfPurchase } from './utils/contractUtils';
import { Share } from '@/types/shares';
import { usePriceEstimation } from './hooks/usePriceEstimation';
import { useSharesSupply } from './hooks/useSharesSupply';
import { validateTradeForm } from './utils/validateTradeForm';
import { useTradeShares } from './hooks/useTradeShares';
import toast from 'react-hot-toast';
import { useSharesBalance } from './hooks/useSharesBalance';
import { SuiClient } from '@mysten/sui/client';

type TradeFormProps = {
  mode: 'buy' | 'sell';
  share?: Share | null;
  userAddress: string;
  onClose: () => void;
  onComplete: () => void;
};

export default function TradeForm({
  mode,
  share,
  userAddress,
  onClose,
  onComplete,
}: TradeFormProps) {
  const [subjectAddress, setSubjectAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentAccount = useCurrentAccount();
  const address = currentAccount?.address;
  
  // ====== Testnet NetworkContractConfig (for demo only) ======
  // You can later switch to dynamic network config
  const TESTNET_SHARES_TRADING_OBJECT_ID = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const TESTNET_FULLNODE_URL = 'https://fullnode.testnet.sui.io';
  // Ensure suiClient is always defined before use
  const suiClient = React.useMemo(() => new SuiClient({ url: TESTNET_FULLNODE_URL }), []);
  // Always pass address as string|null
  const suiAddress: string | null = address || null;

  // Use the new useTradeShares signature (must be before any usage of isPending/isConfirming)
  const { trade, isPending, isConfirming } = useTradeShares(onComplete, suiClient, suiAddress);

  // Build config for usePriceEstimation
  const config = useMemo(() => ({
    packageId: TESTNET_SHARES_TRADING_OBJECT_ID,
    sharesTradingObjectId: TESTNET_SHARES_TRADING_OBJECT_ID,
    suiClient,
  }), [suiClient]);

  // Call usePriceEstimation with correct params and safely get estimatedPrice
  const { data: priceEstimationData } = usePriceEstimation(subjectAddress, Number(amount));
  const estimatedPrice = priceEstimationData?.price ?? null;
  const { data: sharesSupplyData } = useSharesSupply(subjectAddress);
  const sharesSupply = sharesSupplyData?.supply ?? 0n;
  // Query on-chain balance (testnet only)
  const { data: sharesBalanceData } = useSharesBalance(subjectAddress, userAddress);
  const chainBalance = sharesBalanceData?.balance ?? 0n;

  // Check if this is a first share self-purchase (shares supply = 0, buying own shares)
  const firstShareSelfPurchase = isFirstShareSelfPurchase(
    mode,
    subjectAddress,
    address || '',
    sharesSupply.toString() || '0'
  );

  // Memoize the disabled state for subject address input
  const isSubjectAddressDisabled = useMemo(() => {
    // Only for buy mode
    if (mode !== 'buy') return false;
    // If loading, pending, confirming, or share has subject_address, disable
    return isLoading || isPending || isConfirming || Boolean(share && share.subject_address);
  }, [mode, isLoading, isPending, isConfirming, share]);

  useEffect(() => {
    if (mode === 'sell' && share) {
      setSubjectAddress(share.subject_address);
    } else if (mode === 'buy' && share && share.subject_address) {
      setSubjectAddress(share.subject_address);
    }
  }, [mode, share]);
  
  useEffect(() => {
    if (isConfirming) {
      onComplete();
    }
  }, [isConfirming, onComplete]);

  useEffect(() => {
    // Removed refetchPrice related code
    // if (subjectAddress && amount && Number(amount) > 0) {
    //   refetchPrice();
    // }
  }, [subjectAddress, amount]);

  const handleSetMaxAmount = () => {
    if (mode === 'sell' && share) {
      setAmount(share.shares_amount);
    }
  };

  /**
   * Validate form input before submit
   */
  const validateForm = () => {
    const validationError = validateTradeForm(mode, subjectAddress, amount, share);
    if (validationError) {
      setError(validationError);
      return false;
    }
    return true;
  };

  /**
   * Handle form submit for buy/sell shares
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      // Show error as toast
      if (error) toast.error(error);
      return;
    }
    // Guard: do not proceed if address or suiClient is not available
    if (!suiAddress || !suiClient) {
      setError('Wallet not connected or SuiClient unavailable');
      toast.error('Wallet not connected or SuiClient unavailable');
      return;
    }
    setIsLoading(true);
    try {
      if (mode === 'buy') {
        if ((estimatedPrice === null) || ((typeof estimatedPrice === 'bigint' ? Number(estimatedPrice) : Number(estimatedPrice || 0)) === 0 && !firstShareSelfPurchase)) {
          throw new Error('Failed to estimate buy price');
        } else {
          await trade('buy', subjectAddress, amount, estimatedPrice.toString());
        }
      } else {
        await trade('sell', subjectAddress, amount);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Transaction failed';
      setError(msg);
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      {/* Modal: use deep dark background, white text */}
      <div className="bg-[#181f2a]/90 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-scaleIn overflow-hidden">
        {/* Loading overlay */}
        {(isLoading || isPending || isConfirming) && (
          <div className="absolute inset-0 bg-[#181f2a]/80 flex flex-col items-center justify-center z-20 rounded-2xl">
            <svg className="w-12 h-12 text-blue-400 animate-spin mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span className="text-blue-200 font-semibold">Processing...</span>
          </div>
        )}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-t-2xl" />
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">
            {mode === 'buy' ? 'Buy Shares' : 'Sell Shares'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        {error && (
          <div className="mb-4 p-2 bg-red-900/40 border border-red-400 text-red-200 rounded text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'buy' && (
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-1">Subject Address</label>
              <input
                type="text"
                value={subjectAddress}
                onChange={(e) => setSubjectAddress(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232b3a] text-white placeholder:text-slate-400"
                placeholder="Enter the Subject address you want to buy"
                disabled={isSubjectAddressDisabled}
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-1">Amount</label>
            <div className="flex">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-700 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-[#232b3a] text-white placeholder:text-slate-400"
                placeholder="Enter amount"
                disabled={isLoading || isPending || isConfirming}
                required
              />
              {mode === 'sell' && (
                <button
                  type="button"
                  onClick={handleSetMaxAmount}
                  className="bg-gray-700 text-slate-200 px-3 py-2 rounded-r-md hover:bg-gray-600 text-xs font-medium"
                >
                  Max
                </button>
              )}
            </div>
            {mode === 'sell' && share && (
              <div className="text-xs text-slate-400 mt-1">Maximum sellable: {share.shares_amount}</div>
            )}
            {mode === 'sell' && (
              <div className="text-xs text-blue-300 mt-1">On-chain balance: {chainBalance.toString()}</div>
            )}
            {estimatedPrice && (
              <div className="p-2 bg-[#232b3a] rounded mt-2">
                <p className="text-sm font-medium text-slate-200">
                  {mode === 'buy' ? 'Estimated Total Cost' : 'Estimated Total Proceeds'}:
                  <span className="font-bold ml-1 text-white">{formatPrice(estimatedPrice)} MON</span>
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-700 rounded text-slate-200 hover:bg-gray-700 transition"
              disabled={isLoading || isPending || isConfirming}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded text-white font-medium flex items-center gap-2 transition shadow-md ${mode === 'buy' ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600' : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'}`}
              disabled={isLoading || isPending || isConfirming}
            >
              {(isLoading || isPending || isConfirming) && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
              )}
              {isPending || isConfirming ? 'Processing...' : mode === 'buy' ? 'Confirm Buy' : 'Confirm Sell'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Custom toast helpers
export function showSuccessToast(message: string) {
  toast.custom((t) => (
    <div className={`bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
      <svg className="w-5 h-5 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
      <span>{message}</span>
    </div>
  ));
}

export function showErrorToast(message: string) {
  toast.custom((t) => (
    <div className={`bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 ${t.visible ? 'animate-enter' : 'animate-leave'}`}>
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      <span>{message}</span>
    </div>
  ));
}