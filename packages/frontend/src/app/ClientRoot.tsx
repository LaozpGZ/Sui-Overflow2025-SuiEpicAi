'use client';

import GlobalErrorCatcher from './providers/GlobalErrorCatcher';
import ClientProviders from './providers/ClientProviders';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <ClientProviders>
      <GlobalErrorCatcher />
      {children}
    </ClientProviders>
  );
} 