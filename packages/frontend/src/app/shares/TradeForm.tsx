'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { ArrowRight, Check, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

type TradeFormProps = {
  mode: 'buy' | 'sell';
  share?: Share | null;
  userAddress: string;
  onClose: () => void;
  onComplete: () => void;
};

const TradeForm: React.FC<TradeFormProps> = ({ mode, share, userAddress, onClose, onComplete }) => {
  const [subjectAddress, setSubjectAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suiBalance, setSuiBalance] = useState<bigint>(0n);
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [result, setResult] = useState<null | { status: "success" | "error"; message: string }>(null);

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
  const { price: estimatedPrice, loading, error: priceEstimationError } = usePriceEstimation(
    packageId!,
    sharesTradingObjectId!,
    subjectAddress!,
    Number(amount)
  );
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
  const handleSubmit = async (e: React.FormEvent) => {
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
        {result ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {result.status === "success" ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <h3 className="text-lg font-medium text-blue-900">
                {result.status === "success" ? "Transaction Completed" : "Transaction Failed"}
              </h3>
            </div>
            <div className="text-sm text-blue-800">{result.message}</div>
            <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full">
              Close
            </Button>
          </div>
        ) : (
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
        )}
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