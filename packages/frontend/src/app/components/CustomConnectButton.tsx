'use client'

import { ConnectModal, useCurrentAccount } from '@mysten/dapp-kit'
import { Button } from '@radix-ui/themes'
import { useState } from 'react'

const CustomConnectButton = () => {
  const currentAccount = useCurrentAccount()
  const [open, setOpen] = useState(false)

  return (
    <ConnectModal
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="solid" size="4">
          {currentAccount ? 'Wallet Connected' : 'Connect Wallet'}
        </Button>
      }
    />
  )
}

export default CustomConnectButton
