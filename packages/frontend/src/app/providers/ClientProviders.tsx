'use client'

import '@mysten/dapp-kit/dist/index.css'
import '@radix-ui/themes/styles.css'
import '@suiware/kit/main.css'
import SuiProvider from '@suiware/kit/SuiProvider'
import { ThemeProvider as NextThemeProvider } from 'next-themes'
import { ReactNode, useRef } from 'react'
import useNetworkConfig from '@/app/hooks/useNetworkConfig'
import { APP_NAME } from '@/app/config/main'
import { getThemeSettings } from '../helpers/theme'
import { ENetwork } from '@/app/types/ENetwork'
import ThemeProvider from './ThemeProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const themeSettings = getThemeSettings()

export default function ClientProviders({ children }: { children: ReactNode }) {
  const { networkConfig } = useNetworkConfig()
  const queryClientRef = useRef<QueryClient | null>(null)
  if (!queryClientRef.current) {
    queryClientRef.current = new QueryClient()
  }

  return (
    <QueryClientProvider client={queryClientRef.current}>
      <NextThemeProvider attribute="class">
        <ThemeProvider>
          <SuiProvider
            customNetworkConfig={networkConfig}
            defaultNetwork={ENetwork.LOCALNET}
            walletAutoConnect={true}
            walletStashedName={APP_NAME}
            themeSettings={themeSettings}
          >
            {children}
          </SuiProvider>
        </ThemeProvider>
      </NextThemeProvider>
    </QueryClientProvider>
  )
}
