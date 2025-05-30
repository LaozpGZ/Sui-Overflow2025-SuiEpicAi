'use client';

import Image from 'next/image';
import GradientBackground from '@/components/AnimatedBackground';
import SharesTable from './SharesTable';
import TradeForm from './TradeForm';
import { useSharesStore } from './store/useSharesStore';
import CustomConnectButton from '../components/CustomConnectButton';
import { useAllSubjects } from './hooks/useAllSubjects';
import { useUserSharesBalance } from './hooks/useUserSharesBalance';
import Loading from '@/app/components/Loading';
import ErrorMessage from '@/app/components/ErrorMessage';
import { useCurrentAccount } from '@mysten/dapp-kit';
import type { SharesBalanceResult } from '@/types/shares';

export default function SharesPage() {
  const currentAccount = useCurrentAccount();
  const walletAddress = currentAccount?.address;
  const isWalletConnected = !!walletAddress;
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK;
  let sharesTradingObjectId = '';

  if (network === 'testnet') {
    sharesTradingObjectId = process.env.NEXT_PUBLIC_TESTNET_SHARES_TRADING_OBJECT_ID as string;
  } else if (network === 'mainnet') {
    sharesTradingObjectId = process.env.NEXT_PUBLIC_MAINNET_SHARES_TRADING_OBJECT_ID as string;
  } else if (network === 'devnet') {
    sharesTradingObjectId = process.env.NEXT_PUBLIC_DEVNET_SHARES_TRADING_OBJECT_ID as string;
  } else if (network === 'localnet') {
    sharesTradingObjectId = process.env.NEXT_PUBLIC_LOCALNET_SHARES_TRADING_OBJECT_ID as string;
  }

  const { tradeMode, selectedShare, openBuy, openSell, closeTradeForm } = useSharesStore();

  const { data: subjects, loading: loadingSubjects, error: errorSubjects } = useAllSubjects(sharesTradingObjectId);

  // 支持最多100个subject，静态展开hooks
  const MAX_SUBJECTS = 100;
  const paddedSubjects = Array.from({ length: MAX_SUBJECTS }, (_, i) => subjects?.[i] || null);

  const balances = [
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[0] || '', walletAddress || ''),
  ];

  const userShares = (paddedSubjects
    .map((subject, i) =>
      subject
        ? {
            subject,
            sharesAmount: { balance: balances[i].balance }, // The user's share balance for the subject
            loading: balances[i].loading,
            error: balances[i].error,
          }
        : null
    )
    .filter(Boolean)) as { subject: string; sharesAmount: SharesBalanceResult | null; loading: boolean; error: string | null }[];

  const handleTradeComplete = () => {
    closeTradeForm();
  };

  if (loadingSubjects) {
    return <Loading />;
  }
  if (errorSubjects) {
    return (
      <ErrorMessage
        message={
          <>
            <div>{errorSubjects}</div>
            <div className="mt-2 text-sm text-slate-400">
              Possible causes:<br />
              1. The environment variable <b>NEXT_PUBLIC_XXX_SHARES_TRADING_OBJECT_ID</b> is incorrect.<br />
              2. The contract object on-chain is not properly initialized (missing <b>shares_supply</b> field).<br />
              3. The current network does not match the objectId&apos;s network.<br />
              <br />
              Please use suiexplorer to inspect the objectId, or contact the developer for assistance.
            </div>
          </>
        }
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-blue-100 via-blue-50 to-white flex flex-col items-center justify-start pt-24 pb-12 relative">
      <nav className="h-20 w-full flex justify-between items-center px-8 text-white text-2xl font-semibold">
        <div className="flex items-center gap-1">
          <Image src="/logo.svg" alt="SuiEpicAI" width={32} height={32} />
          SuiEpicAI
        </div>
        <CustomConnectButton />
      </nav>
      <GradientBackground />

      <h1 className="text-4xl md:text-5xl font-extrabold mb-8 bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text drop-shadow-lg">My Shares</h1>

      <div className="w-full max-w-lg bg-[#181f2a] rounded-2xl shadow-3xl backdrop-blur border border-blue-800 px-6 py-6 md:px-8 md:py-8 flex flex-col items-stretch">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4 md:gap-0">
          <h2 className="text-2xl font-bold text-white">Shares Balance</h2>
          <div className="flex gap-2">
            <button
              onClick={openBuy}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:scale-95 transition px-4 py-2 rounded shadow-lg text-white text-base font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              Buy
            </button>
          </div>
        </div>
        <div className="border-b border-blue-900/60 mb-4" />

        {!isWalletConnected ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-2">
              <svg width="56" height="56" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#334155"/></svg>
              <p className="text-lg md:text-xl mb-4 text-slate-400">Please connect wallet to view your Shares</p>
            </div>
          </div>
        ) : (
          <>
            {userShares.length === 0 ? (
              <div className="text-center py-8">
                <p>You don&apos;t have any Shares yet</p>
              </div>
            ) : (
              <>
                <SharesTable 
                  userShares={userShares} 
                  onSell={(subject, sharesAmount) => openSell({ subject_address: subject, shares_amount: sharesAmount })} 
                />

                {tradeMode && (
                  <TradeForm 
                    mode={tradeMode} 
                    share={selectedShare}
                    onComplete={handleTradeComplete}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      <div className="absolute inset-0 -z-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <defs>
            <radialGradient id="bg-grad1" cx="50%" cy="40%" r="80%" fx="50%" fy="40%" gradientTransform="rotate(20)">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#a21caf" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#181f2a" stopOpacity="0.0" />
            </radialGradient>
          </defs>
          <ellipse cx="720" cy="400" rx="700" ry="350" fill="url(#bg-grad1)" filter="url(#blur1)" />
          <filter id="blur1">
            <feGaussianBlur stdDeviation="80" />
          </filter>
        </svg>
      </div>
    </div>
  );
} 