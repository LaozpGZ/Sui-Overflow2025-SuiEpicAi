'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { usePriceEstimation } from '@/app/shares/hooks/usePriceEstimation';
import { useSharesSupply } from '@/app/shares/hooks/useSharesSupply';
import { useTradeShares } from '@/app/shares/hooks/useTradeShares';
import { useSharesBalance } from '@/app/shares/hooks/useSharesBalance';
import { 
  getPriceEstimationParams, 
  getBuySharesParams, 
  getSellSharesParams,
  formatPrice,
  getSharesSupplyParams
} from '@/app/helpers/contract';

type TradeFormProps = {
  mode: 'buy' | 'sell';
  share?: {
    subject_address: string;
    shares_amount: string;
  } | null;
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
  const [estimatedPrice, setEstimatedPrice] = useState<string | null>(null);

  const address = userAddress;
  const { data: priceEstimationData, isLoading: isPriceLoading } = usePriceEstimation(subjectAddress, Number(amount));
  const { data: sharesSupplyData, isLoading: isSupplyLoading } = useSharesSupply(subjectAddress);
  const sharesSupply = sharesSupplyData?.supply ?? 0n;
  const { data: sharesBalanceData } = useSharesBalance(subjectAddress, userAddress);
  const chainBalance = sharesBalanceData?.balance ?? 0n;
  const { trade, isPending, isConfirming, error: tradeError } = useTradeShares(onComplete, null, address);

  useEffect(() => {
    if (mode === 'sell' && share) {
      setSubjectAddress(share.subject_address);
    } else if (mode === 'buy' && share && share.subject_address) {
      setSubjectAddress(share.subject_address);
    }
  }, [mode, share]);
  
  useEffect(() => {
    if (priceEstimationData?.price !== undefined && priceEstimationData?.price !== null) {
      setEstimatedPrice(priceEstimationData.price.toString());
    }
  }, [priceEstimationData]);

  // Check if this is a first share self-purchase (shares supply = 0, buying own shares)
  const isFirstShareSelfPurchase = 
    mode === 'buy' && 
    subjectAddress && 
    address && 
    subjectAddress.toLowerCase().replace(/^0x/, '') === address.toLowerCase().replace(/^0x/, '') && 
    sharesSupply === 0n;

  useEffect(() => {
    if (subjectAddress && amount && Number(amount) > 0) {
      // Refetch price estimation
    }
  }, [subjectAddress, amount]);

  const handleSetMaxAmount = () => {
    if (mode === 'sell' && share) {
      setAmount(share.shares_amount);
    }
  };

  const validateForm = () => {
    if (!subjectAddress) {
      setError('Please enter Subject address');
      return false;
    }

    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }

    if (
      mode === 'sell' &&
      share &&
      Number(amount) > Number(share.shares_amount)
    ) {
      setError('Sell amount cannot exceed your balance');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      await trade(mode, subjectAddress, amount, estimatedPrice ?? undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">
            {mode === 'buy' ? 'Buy Shares' : 'Sell Shares'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'buy' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject Address
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={subjectAddress}
                onChange={e => setSubjectAddress(e.target.value)}
                disabled={!!share}
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="1"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                disabled={isLoading}
              />
              {mode === 'sell' && share && (
                <button
                  type="button"
                  className="text-blue-500 underline text-xs"
                  onClick={handleSetMaxAmount}
                >
                  Max
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated {mode === 'buy' ? 'Buy' : 'Sell'} Price
            </label>
            <div className="bg-gray-100 rounded px-3 py-2">
              {estimatedPrice !== null ? formatPrice(estimatedPrice) : '--'} ETH
            </div>
          </div>

          <button
            type="submit"
            className={`w-full py-2 rounded-lg text-white font-semibold ${
              mode === 'buy'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
            } ${isLoading || isPending || isConfirming ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading || isPending || isConfirming}
          >
            {isLoading || isPending || isConfirming
              ? 'Processing...'
              : mode === 'buy'
                ? 'Buy'
                : 'Sell'}
          </button>
        </form>
      </div>
    </div>
  );
} 