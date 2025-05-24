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
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[1] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[2] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[3] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[4] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[5] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[6] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[7] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[8] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[9] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[10] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[11] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[12] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[13] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[14] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[15] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[16] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[17] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[18] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[19] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[20] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[21] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[22] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[23] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[24] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[25] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[26] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[27] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[28] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[29] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[30] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[31] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[32] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[33] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[34] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[35] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[36] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[37] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[38] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[39] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[40] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[41] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[42] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[43] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[44] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[45] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[46] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[47] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[48] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[49] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[50] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[51] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[52] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[53] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[54] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[55] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[56] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[57] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[58] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[59] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[60] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[61] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[62] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[63] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[64] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[65] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[66] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[67] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[68] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[69] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[70] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[71] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[72] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[73] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[74] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[75] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[76] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[77] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[78] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[79] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[80] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[81] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[82] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[83] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[84] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[85] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[86] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[87] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[88] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[89] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[90] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[91] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[92] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[93] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[94] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[95] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[96] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[97] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[98] || '', walletAddress || ''),
    useUserSharesBalance(sharesTradingObjectId, paddedSubjects[99] || '', walletAddress || ''),
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
    return <ErrorMessage message={errorSubjects} />;
  }

  return (
    <div className="min-h-screen w-full bg-[#181f2a] flex flex-col items-center justify-start pt-24 pb-12 relative">
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
                    userAddress={walletAddress || ''}
                    onClose={closeTradeForm}
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