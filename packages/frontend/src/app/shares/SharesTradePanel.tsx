import React, { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useBuyShares } from './hooks/useBuyShares';
import { useSellShares } from './hooks/useSellShares';
import { useSharesSupply } from './hooks/useSharesSupply';
import { useUserSharesBalance } from './hooks/useUserSharesBalance';
import { useSuiBalance } from './hooks/useSuiBalance';
import { usePriceEstimation } from './hooks/usePriceEstimation';
import type { WalletAdapterWithSign } from '@/app/types/WalletAdapterWithSign';
import { SuiClient } from '@mysten/sui/client';

// Read contract IDs from environment variables
const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
const SHARES_TRADING_OBJECT_ID = process.env.NEXT_PUBLIC_SHARES_TRADING_OBJECT_ID!;

interface SharesTradePanelProps {
  subjectAddress: string;
  suiClient: SuiClient;
  walletAdapter?: WalletAdapterWithSign;
}

/**
 * SharesTradePanel - UI component for buying/selling shares on Sui blockchain.
 * Shows supply, user balance, SUI balance, price estimation, and buy/sell forms.
 * @param suiClient SuiClient instance for blockchain interaction.
 */
export const SharesTradePanel: React.FC<SharesTradePanelProps> = ({ subjectAddress, suiClient, walletAdapter }) => {
  const currentAccount = useCurrentAccount();
  const userAddress = currentAccount?.address || '';
  const { supply, loading: supplyLoading } = useSharesSupply(SHARES_TRADING_OBJECT_ID, subjectAddress);
  const { balance: userShares, loading: userSharesLoading } = useUserSharesBalance(SHARES_TRADING_OBJECT_ID, subjectAddress, userAddress);
  const { balance: suiBalance, loading: suiLoading } = useSuiBalance(userAddress);
  const [amount, setAmount] = useState('');
  const { price, loading: priceLoading } = usePriceEstimation(PACKAGE_ID, SHARES_TRADING_OBJECT_ID, subjectAddress, Number(amount));
  const { buy, isPending: isBuying, error: buyError } = useBuyShares(suiClient, walletAdapter);
  const { sell, isPending: isSelling, error: sellError } = useSellShares(suiClient, walletAdapter);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');

  const handleTrade = async () => {
    if (mode === 'buy') {
      await buy(subjectAddress, amount, price.toString());
    } else {
      await sell(subjectAddress, amount);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-zinc-900 rounded-xl shadow-lg space-y-6 border border-zinc-200 dark:border-zinc-800">
      <h2 className="text-2xl font-bold mb-2 text-center">Shares Trading</h2>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Total Supply:</span>
          <span>{supplyLoading ? 'Loading...' : supply.toString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium">Your Shares:</span>
          <span>{userSharesLoading ? 'Loading...' : userShares.toString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="font-medium">Your SUI Balance:</span>
          <span>{suiLoading ? 'Loading...' : suiBalance.toString()}</span>
        </div>
      </div>
      <div className="flex gap-2 justify-center mt-4">
        <button
          className={`px-4 py-2 rounded-lg font-semibold border ${mode === 'buy' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'}`}
          onClick={() => setMode('buy')}
        >
          Buy
        </button>
        <button
          className={`px-4 py-2 rounded-lg font-semibold border ${mode === 'sell' ? 'bg-red-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200'}`}
          onClick={() => setMode('sell')}
        >
          Sell
        </button>
      </div>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Amount</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-800 dark:text-white"
          placeholder="Enter amount"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="font-medium">Estimated Price:</span>
          <span>{priceLoading ? 'Estimating...' : price.toString()}</span>
        </div>
      </div>
      <button
        className={`w-full py-2 mt-2 rounded-lg font-bold text-lg ${mode === 'buy' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'} disabled:opacity-50`}
        onClick={handleTrade}
        disabled={isBuying || isSelling || !amount || Number(amount) <= 0}
      >
        {mode === 'buy' ? (isBuying ? 'Buying...' : 'Buy Shares') : (isSelling ? 'Selling...' : 'Sell Shares')}
      </button>
      {(buyError || sellError) && (
        <div className="text-red-500 text-sm text-center mt-2">
          {buyError || sellError}
        </div>
      )}
    </div>
  );
}; 