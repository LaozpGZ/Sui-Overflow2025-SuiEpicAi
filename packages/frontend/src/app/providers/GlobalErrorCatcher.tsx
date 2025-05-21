'use client';

import { useEffect, useState } from 'react';

export default function GlobalErrorCatcher() {
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    function handler(event: PromiseRejectionEvent) {
      console.error('Global unhandled Promise error:', event.reason);
      setError(event.reason);
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', handler);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('unhandledrejection', handler);
      }
    };
  }, []);

  if (error) {
    // Support both object and string error types
    const errorMsg = typeof error === 'object' && error !== null && 'message' in error
      ? (error as { message?: string }).message || JSON.stringify(error)
      : String(error);
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        background: 'rgba(255,0,0,0.85)',
        color: 'white',
        zIndex: 9999,
        padding: '16px',
        fontSize: '16px',
        textAlign: 'center',
      }}>
        Error occurred: {errorMsg}
      </div>
    );
  }
  return null;
} 