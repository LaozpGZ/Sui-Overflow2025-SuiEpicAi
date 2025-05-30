import { type Metadata } from 'next'
import Header from '@/app/components/layout/Header'
import Body from '@/app/components/layout/Body'
import Extra from '@/app/components/layout/Extra'
import Footer from '@/app/components/layout/Footer'
import { APP_DESCRIPTION, APP_NAME } from './config/main'
import ClientRoot from './ClientRoot'
import './styles/index.css'
import { Toaster } from 'react-hot-toast'
import React from 'react'

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Toaster position="top-center" />
        <ClientRoot>
          <div className="flex min-h-screen flex-col items-center justify-center gap-6">
            <Header />
            <Body>{children}</Body>
            <Footer />
            <Extra />
          </div>
        </ClientRoot>
      </body>
    </html>
  )
}
