'use client';

import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { useSuiClient, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { formatPrice, isFirstShareSelfPurchase } from './utils/contractUtils';
import { Share } from '@/types/shares';
import { usePriceEstimation } from './hooks/usePriceEstimation';
import { useSharesSupply } from './hooks/useSharesSupply';
import { validateTradeForm } from './utils/validateTradeForm';
import { useTradeShares } from './hooks/useTradeShares';
import toast from 'react-hot-toast';
import { useSharesBalance } from './hooks/useSharesBalance';
import { CURRENT_NETWORK_CONFIG } from '@/config/network';
import Loading from '@/app/components/Loading';
import ErrorMessage from '@/app/components/ErrorMessage';

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
  const [suiBalance, setSuiBalance] = useState<bigint>(0n);

  // Get SuiClient, network variables, and wallet from context
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const currentWallet = wallets.find(
    (wallet) => wallet.accounts.some((acc) => acc.address === currentAccount?.address)
  );

  // Get objectId and packageId from network variables
  const sharesTradingObjectId = CURRENT_NETWORK_CONFIG.sharesTradingObjectId;
  const packageId = CURRENT_NETWORK_CONFIG.packageId;

  // Pass wallet object to useTradeShares
  const { trade, isPending, isConfirming } = useTradeShares(onComplete, suiClient, currentWallet);

  // Call usePriceEstimation with correct params and safely get estimatedPrice
  const { price, loading, error: priceEstimationError } = usePriceEstimation(
    packageId!,
    sharesTradingObjectId!,
    subjectAddress!,
    Number(amount)
  );
  const estimatedPrice = price ?? null;
  const { supply: sharesSupply } = useSharesSupply(
    sharesTradingObjectId!,
    subjectAddress!
  );
  // Query on-chain balance (testnet only)
  const { data: sharesBalanceData } = useSharesBalance(
    sharesTradingObjectId!,
    subjectAddress!,
    userAddress!
  );
  const chainBalance = sharesBalanceData?.balance ?? 0n;

  // Check if this is a first share self-purchase (shares supply = 0, buying own shares)
  const firstShareSelfPurchase = isFirstShareSelfPurchase(
    mode,
    subjectAddress,
    currentAccount?.address || '',
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

  // 查询用户 SUI 余额
  useEffect(() => {
    async function fetchBalance() {
      if (currentAccount?.address && suiClient) {
        const coins = await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: '0x2::sui::SUI',
        });
        const total = coins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
        setSuiBalance(total);
      }
    }
    fetchBalance();
  }, [currentAccount, suiClient]);

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
      if (priceEstimationError) toast.error(priceEstimationError);
      return;
    }
    // Guard: do not proceed if address or suiClient is not available
    if (!currentAccount?.address || !suiClient) {
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

  // 价格分解（假设合约 fee 逻辑为 5% protocol + 5% subject）
  let principal = BigInt(0), protocolFee = BigInt(0), subjectFee = BigInt(0), total = BigInt(0);
  if (estimatedPrice) {
    // 这里假设 estimatedPrice 是总价，反推本金和 fee（如需更精确可后端返回详细分解）
    // 你可以根据合约 fee 逻辑调整
    // total = principal + protocolFee + subjectFee
    // protocolFee = principal * 0.05
    // subjectFee = principal * 0.05
    // total = principal * 1.1
    // principal = estimatedPrice / 1.1
    principal = BigInt(Math.floor(Number(estimatedPrice) / 1.1));
    protocolFee = BigInt(Math.floor(Number(principal) * 0.05));
    subjectFee = BigInt(Math.floor(Number(principal) * 0.05));
    total = principal + protocolFee + subjectFee;
  }

  // 检查余额是否足够
  const isBalanceEnough = mode === 'buy' ? (estimatedPrice !== null && suiBalance >= BigInt(estimatedPrice)) : true;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
      {/* Modal: use deep dark background, white text */}
      <div className="bg-[#181f2a]/90 rounded-2xl shadow-2xl p-6 w-full max-w-md relative animate-scaleIn overflow-hidden">
        {/* Loading overlay */}
        {(isLoading || isPending || isConfirming) && <Loading />}
        {error && <ErrorMessage message={error} />}
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
            {mode === 'buy' && (
              <div className="text-xs text-blue-300 mt-1">Your SUI balance: {formatPrice(suiBalance)} SUI</div>
            )}
            {mode === 'buy' && !isBalanceEnough && (
              <div className="text-xs text-red-400 mt-1">Insufficient SUI balance. You need at least {formatPrice(estimatedPrice)} SUI.</div>
            )}
            {estimatedPrice && (
              <div className="p-2 bg-[#232b3a] rounded mt-2">
                <p className="text-sm font-medium text-slate-200 mb-1">
                  {mode === 'buy' ? 'Estimated Total Cost' : 'Estimated Total Proceeds'}:
                  <span className="font-bold ml-1 text-white">{formatPrice(estimatedPrice)} SUI</span>
                </p>
                {mode === 'buy' && (
                  <div className="text-xs text-slate-300 space-y-1 mt-1">
                    <div>Principal: <span className="font-mono">{formatPrice(principal)} SUI</span></div>
                    <div>Protocol Fee: <span className="font-mono">{formatPrice(protocolFee)} SUI</span></div>
                    <div>Subject Fee: <span className="font-mono">{formatPrice(subjectFee)} SUI</span></div>
                    <div className="font-bold">Total: <span className="font-mono">{formatPrice(total)} SUI</span></div>
                  </div>
                )}
              </div>
            )}
            {/* Show loading state for price estimation */}
            {loading && (
              <div className="text-xs text-blue-400 mt-2">Estimating price...</div>
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
              disabled={isLoading || isPending || isConfirming || (mode === 'buy' && !isBalanceEnough)}
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