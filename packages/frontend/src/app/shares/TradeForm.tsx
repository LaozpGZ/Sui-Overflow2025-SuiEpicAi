'use client';

import React, { useState, useEffect } from 'react';
import { useSuiClient, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { isFirstShareSelfPurchase } from './utils/contractUtils';
import { Share } from '@/types/shares';
import { usePriceEstimation } from './hooks/usePriceEstimation';
import { useSharesSupply } from './hooks/useSharesSupply';
import { validateTradeForm } from './utils/validateTradeForm';
import { useTradeShares } from './hooks/useTradeShares';
import toast from 'react-hot-toast';
import { CURRENT_NETWORK_CONFIG } from '@/config/network';
import { ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

type TradeFormProps = {
  mode: 'buy' | 'sell';
  share?: Share | null;
  onComplete: () => void;
};

const TradeForm: React.FC<TradeFormProps> = ({ mode, share, onComplete }) => {
  const [subjectAddress, setSubjectAddress] = useState('');
  const [amount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);

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
  const { trade, isConfirming } = useTradeShares(onComplete, suiClient, currentWallet);

  // Call usePriceEstimation with correct params and safely get estimatedPrice
  const { price: estimatedPrice, error: priceEstimationError } = usePriceEstimation(
    packageId!,
    sharesTradingObjectId!,
    subjectAddress!,
    Number(amount)
  );
  const { supply: sharesSupply } = useSharesSupply(
    sharesTradingObjectId!,
    subjectAddress!
  );

  // Check if this is a first share self-purchase (shares supply = 0, buying own shares)
  const firstShareSelfPurchase = isFirstShareSelfPurchase(
    mode,
    subjectAddress,
    currentAccount?.address || '',
    sharesSupply.toString() || '0'
  );

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

  // Fetch user's SUI balance (not used in this component)
  useEffect(() => {
    async function fetchBalance() {
      if (currentAccount?.address && suiClient) {
        await suiClient.getCoins({
          owner: currentAccount.address,
          coinType: '0x2::sui::SUI',
        });
      }
    }
    fetchBalance();
  }, [currentAccount, suiClient]);

  /**
   * Validate form input before submit
   */
  const validateForm = () => {
    const validationError = validateTradeForm(mode, subjectAddress, amount, share);
    if (validationError) {
      return false;
    }
    return true;
  };

  /**
   * Handle form submit for buy/sell shares
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Show error as toast
      if (priceEstimationError) toast.error(priceEstimationError);
      return;
    }
    // Guard: do not proceed if address or suiClient is not available
    if (!currentAccount?.address || !suiClient) {
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
      toast.error(msg);
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-blue-200 shadow-lg w-full max-w-md mx-auto bg-blue-100">
      <CardHeader className="pb-2 border-b border-blue-100 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-2xl">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-white drop-shadow">{mode === "buy" ? "Buy Shares" : "Sell Shares"}</CardTitle>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 shadow-sm">
            {mode === "buy" ? <TrendingUp className="h-4 w-4 mr-1 inline" /> : <TrendingDown className="h-4 w-4 mr-1 inline" />}
            {mode === "buy" ? "Buy" : "Sell"}
          </Badge>
        </div>
        <CardDescription className="text-blue-100/90 mt-1">{mode === "buy" ? "Buy shares at market price" : "Sell your shares at market price"}</CardDescription>
      </CardHeader>
      <CardContent className="bg-blue-50/80 rounded-b-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-blue-900">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity || ""}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Enter quantity"
              className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-blue-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price" className="text-blue-900">Price per share ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={price || ""}
              onChange={(e) => setPrice(Number(e.target.value))}
              placeholder="Enter price"
              className="bg-white border-blue-200 focus:border-blue-500 focus:ring-blue-500 text-blue-900"
            />
          </div>
          {quantity > 0 && price > 0 && (
            <div className="py-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Total:</span>
                <span className="font-bold text-blue-900">${(quantity * price).toFixed(2)}</span>
              </div>
            </div>
          )}
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full gap-2 shadow-md"
            disabled={quantity <= 0 || price <= 0 || isLoading}
          >
            {isLoading ? "Processing..." : mode === "buy" ? "Buy Shares" : "Sell Shares"}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center border-t pt-4 text-xs text-blue-600 bg-blue-100 rounded-b-2xl">
        <p>Market data may be delayed. Trade at your own risk.</p>
      </CardFooter>
    </Card>
  );
};

export default TradeForm;

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