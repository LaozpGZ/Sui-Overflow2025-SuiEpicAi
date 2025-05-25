'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAgentDetail, AgentDetail } from '@/components/agentService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SharesTradePanel } from '@/app/shares/SharesTradePanel';
import { useSuiClient, useWallets, useCurrentAccount } from '@mysten/dapp-kit';
import type { WalletAdapterWithSign } from '@/app/types/WalletAdapterWithSign';
import AgentProfileCard from './AgentProfileCard';

export default function AgentDetailClient({ name }: { name: string }) {
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch agent detail from backend
  useEffect(() => {
    if (typeof name !== 'string' || name.trim() === '') {
      setError('Invalid agent name');
      setAgent(null);
      setLoading(false);
      return;
    }
    const loadAgentDetail = async () => {
      setLoading(true);
      try {
        const encodedName = encodeURIComponent(name);
        const data = await fetchAgentDetail(encodedName);
        setAgent(data);
        setError('');
      } catch {
        setError('Failed to load agent details. Please try again later.');
        setAgent(null);
      } finally {
        setLoading(false);
      }
    };
    loadAgentDetail();
  }, [name]);

  const suiClient = useSuiClient();
  const wallets = useWallets();
  const currentAccount = useCurrentAccount();
  // Find the wallet for the current account
  // SuiClient is obtained from useSuiClient() and passed as a prop for blockchain interaction
  const wallet = wallets.find(w => w.accounts.some(a => a.address === currentAccount?.address));
  // Type guard for signAndExecuteTransactionBlock
  let walletAdapter: WalletAdapterWithSign | undefined = undefined;
  const feature = wallet?.features?.['standard:signAndExecuteTransactionBlock'];
  if (feature && typeof feature === 'object' && 'signAndExecuteTransactionBlock' in feature) {
    walletAdapter = feature as WalletAdapterWithSign;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-3xl w-full bg-white/80 rounded-lg p-6 mx-auto shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-extrabold text-blue-900">Agent Detail</h1>
            <Link href="/agent-list">
              <button className="bg-blue-100 text-blue-900 px-4 py-2 rounded-md shadow-sm hover:brightness-110 font-semibold">Back to Agent list</button>
            </Link>
          </div>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
            {error || 'Agent not found'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-6 px-1">
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-extrabold text-blue-900">Agent Detail</h1>
          <Link href="/agent-list">
            <button className="bg-blue-100 text-blue-900 px-3 py-1.5 rounded-md shadow-sm hover:brightness-110 font-semibold text-base">Back to Agent list</button>
          </Link>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-0 overflow-hidden">
          <AgentProfileCard
            name={agent.agent_name}
            address={agent.subject_address}
            bio={agent.bio}
            avatarUrl={(() => {
              try {
                const match = agent.bio?.match(/"image"\s*:\s*"([^"]+)"/);
                return match ? match[1] : undefined;
              } catch {
                return undefined;
              }
            })()}
            inviteUrl={agent.invite_url}
          />
          <div className="border-t border-blue-100 my-1 md:my-2 w-full" />
          <div className="px-2 md:px-4 pb-4 pt-1 md:pt-2">
            <SharesTradePanel
              subjectAddress={agent.subject_address}
              suiClient={suiClient}
              walletAdapter={walletAdapter}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 