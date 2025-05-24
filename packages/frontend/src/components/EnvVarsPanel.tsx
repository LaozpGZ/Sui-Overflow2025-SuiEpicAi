"use client";

import React from "react";

/**
 * EnvVarsPanel
 * A reusable component that displays all environment variables
 * starting with NEXT_PUBLIC_ in a table format.
 *
 * Usage: <EnvVarsPanel />
 */
export default function EnvVarsPanel() {
  // Get all environment variables that start with NEXT_PUBLIC_
  const envVars = Object.entries(process.env)
    .filter(([key]) => key.startsWith("NEXT_PUBLIC_"))
    .sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="mb-8 p-6 bg-gray-100 rounded-xl shadow">
      <h2 className="text-lg font-bold mb-2 text-blue-800 flex items-center gap-2">
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 9h6v6H9z"/></svg>
        Environment Variables Panel (NEXT_PUBLIC_*)
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-1">Variable</th>
              <th className="text-left px-2 py-1">Value</th>
            </tr>
          </thead>
          <tbody>
            {envVars.map(([key, value]) => (
              <tr key={key}>
                <td className="font-mono px-2 py-1 text-blue-900">{key}</td>
                <td className="font-mono px-2 py-1 text-gray-700 break-all">{value || <span className="text-red-500">Not set</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 