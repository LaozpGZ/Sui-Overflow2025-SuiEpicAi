'use client';

import { useState } from 'react';
import { Share } from '@/types/shares';

// Props for SharesTable
type SharesTableProps = {
  shares: Share[];
  onSell: (share: Share) => void;
};

export default function SharesTable({ shares, onSell }: SharesTableProps) {
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
          {shares.length === 0 ? (
            <tr>
              <td colSpan={3} className="py-10 text-center text-slate-400 rounded-b-xl bg-[#181f2a]/90">
                <div className="flex flex-col items-center gap-2">
                  <svg width="48" height="48" fill="none" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#334155"/></svg>
                  <span className="text-base md:text-lg">You don't have any Shares yet</span>
                </div>
              </td>
            </tr>
          ) : (
            shares.map((share, idx) => (
              <tr
                key={share.subject_address}
                className={`border-b border-gray-700 transition-all duration-200 ${idx % 2 === 0 ? 'bg-[#232b3a]/80' : 'bg-[#181f2a]/90'} hover:bg-blue-900/40 hover:scale-[1.01]`}
              >
                <td className="py-3 px-4 font-mono text-xs md:text-sm break-all text-white">
                  {share.subject_address}
                </td>
                <td className="py-3 px-4 text-xs md:text-sm text-white">{share.shares_amount}</td>
                <td className="py-3 px-4 text-right">
                  {Number(share.shares_amount) > 0 && (
                    <button
                      onClick={() => onSell(share)}
                      className="inline-flex items-center gap-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 active:scale-95 hover:brightness-110 transition px-3 py-1 rounded-lg shadow-lg text-xs md:text-sm font-bold text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H7V5a2 2 0 012-2zm0 0V3m0 2v2" /></svg>
                      Sell
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
} 