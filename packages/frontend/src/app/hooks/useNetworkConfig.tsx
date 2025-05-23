import { createNetworkConfig } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import {
  CONTRACT_PACKAGE_VARIABLE_NAME,
  EXPLORER_URL_VARIABLE_NAME,
  NETWORK_CONFIG
} from '@/config/network'
import { ENetwork } from '@/app/types/ENetwork'

const useNetworkConfig = () => {
  return createNetworkConfig({
    [ENetwork.LOCALNET]: {
      url: getFullnodeUrl(ENetwork.LOCALNET),
      variables: {
        [CONTRACT_PACKAGE_VARIABLE_NAME]: NETWORK_CONFIG.localnet.packageId,
        [EXPLORER_URL_VARIABLE_NAME]: NETWORK_CONFIG.localnet.explorerUrl,
      },
    },
    [ENetwork.DEVNET]: {
      url: getFullnodeUrl(ENetwork.DEVNET),
      variables: {
        [CONTRACT_PACKAGE_VARIABLE_NAME]: NETWORK_CONFIG.devnet.packageId,
        [EXPLORER_URL_VARIABLE_NAME]: NETWORK_CONFIG.devnet.explorerUrl,
      },
    },
    [ENetwork.TESTNET]: {
      url: getFullnodeUrl(ENetwork.TESTNET),
      variables: {
        [CONTRACT_PACKAGE_VARIABLE_NAME]: NETWORK_CONFIG.testnet.packageId,
        [EXPLORER_URL_VARIABLE_NAME]: NETWORK_CONFIG.testnet.explorerUrl,
      },
    },
    [ENetwork.MAINNET]: {
      url: getFullnodeUrl(ENetwork.MAINNET),
      variables: {
        [CONTRACT_PACKAGE_VARIABLE_NAME]: NETWORK_CONFIG.mainnet.packageId,
        [EXPLORER_URL_VARIABLE_NAME]: NETWORK_CONFIG.mainnet.explorerUrl,
      },
    },
  })
}

export default useNetworkConfig
