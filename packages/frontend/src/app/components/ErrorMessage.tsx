import React from 'react';

export default function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 flex items-center gap-2">
      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      <span>错误：{message}</span>
    </div>
  );
} 