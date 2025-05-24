'use client';

import Loading from '@/app/components/Loading';
import ErrorMessage from '@/app/components/ErrorMessage';
import type { SharesBalanceResult } from '@/types/shares';

// Props for SharesTable
export type SharesTableProps = {
  userShares: { subject: string; sharesAmount: SharesBalanceResult | null; loading: boolean; error: string | null }[];
  onSell: (subjectAddress: string, sharesAmount: string) => void;
};

function getDisplayAmount(sharesAmount: SharesBalanceResult | null): string {
  if (!sharesAmount) return '0';
  if (typeof sharesAmount === 'object' && 'balance' in sharesAmount) return sharesAmount.balance.toString();
  return '0';
}

export default function SharesTable({ userShares, onSell }: SharesTableProps) {
  if (!userShares || userShares.length === 0) {
    return <div>No shares data available.</div>;
  }
  return (
    <div className="overflow-x-auto">
      {/* Table: use deep dark background, white text */}
      <table className="min-w-full border-collapse rounded-xl overflow-hidden shadow-2xl bg-[#181f2a]/90">
        <thead>
          <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md">
            <th className="py-3 px-4 text-left rounded-tl-xl">Subject Address</th>
            <th className="py-3 px-4 text-left">Shares Balance</th>
            <th className="py-3 px-4 text-right rounded-tr-xl">Actions</th>
          </tr>
        </thead>
        <tbody>
          {userShares.map(({ subject, sharesAmount, loading, error }, idx) => (
            <tr
              key={subject}
              className={`border-b border-gray-700 transition-all duration-200 ${idx % 2 === 0 ? 'bg-[#232b3a]/80' : 'bg-[#181f2a]/90'} hover:bg-blue-900/40 hover:scale-[1.01]`}
            >
              <td className="py-3 px-4 font-mono text-xs md:text-sm break-all text-white">
                {subject}
              </td>
              <td className="py-3 px-4 text-xs md:text-sm text-white">
                {loading ? <Loading /> : error ? <ErrorMessage message={error} /> : getDisplayAmount(sharesAmount)}
              </td>
              <td className="py-3 px-4 text-right">
                {sharesAmount && !loading && !error && (
                  <button
                    onClick={() => onSell(subject, getDisplayAmount(sharesAmount))}
                    className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 active:scale-95 hover:brightness-110 transition px-3 py-1 rounded-lg shadow-lg text-xs md:text-sm font-bold text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
                    Sell
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 