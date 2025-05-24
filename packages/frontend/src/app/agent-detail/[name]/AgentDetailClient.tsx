'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchAgentDetail, AgentDetail } from '@/components/agentService';
import LoadingSpinner from '@/components/LoadingSpinner';
import { SharesTradePanel } from '@/app/shares/SharesTradePanel';
import { useSuiClient, useWallets, useCurrentAccount } from '@mysten/dapp-kit';

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
  const wallet = wallets.find(w => w.accounts.some(a => a.address === currentAccount?.address));
  // Type guard for signAndExecuteTransactionBlock
  let walletAdapter: any = undefined;
  const feature = wallet?.features?.['standard:signAndExecuteTransactionBlock'];
  if (feature && typeof feature === 'object' && 'signAndExecuteTransactionBlock' in feature) {
    walletAdapter = (feature as any).signAndExecuteTransactionBlock;
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-2">
      <div className="max-w-3xl w-full bg-white/80 rounded-lg p-6 mx-auto shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-extrabold text-blue-900">Agent Detail</h1>
          <Link href="/agent-list">
            <button className="bg-blue-100 text-blue-900 px-4 py-2 rounded-md shadow-sm hover:brightness-110 font-semibold">Back to Agent list</button>
          </Link>
        </div>
        <h2 className="text-3xl font-extrabold text-blue-900 mb-3 text-center">{agent.agent_name}</h2>
        <hr className="border-blue-100 mb-5" />

        <div className="mb-4">
          <div className="text-base font-bold text-blue-800 mb-1">Subject Address</div>
          <div className="text-sm font-mono bg-blue-50 text-blue-900 p-3 rounded-md break-all">
            {agent.subject_address}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-base font-bold text-blue-800 mb-1">Bio</div>
          <div className="text-sm bg-blue-50 text-blue-900 p-3 rounded-md whitespace-pre-wrap">
            {agent.bio || 'No bio available'}
          </div>
        </div>

        <div className="mb-4">
          <div className="text-base font-bold text-blue-800 mb-1">Invite URL</div>
          <a
            href={agent.invite_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 hover:underline break-all block mb-4"
          >
            {agent.invite_url}
          </a>
        </div>

        {/* Chain-based shares trading panel */}
        <SharesTradePanel
          subjectAddress={agent.subject_address}
          suiClient={suiClient}
          walletAdapter={walletAdapter}
        />
      </div>
    </div>
  );
} 