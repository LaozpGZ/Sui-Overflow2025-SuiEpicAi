'use client'

import React from 'react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center py-8">
      <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      <span className="ml-2 text-blue-500">加载中...</span>
    </div>
  )
}
