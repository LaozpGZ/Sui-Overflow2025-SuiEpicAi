// Sui network config for different environments
export type SuiNetwork = 'testnet' | 'mainnet' | 'devnet';

export interface SuiNetworkConfig {
  packageId: string;
  sharesTradingObjectId: string;
  fullnodeUrl: string;
}

export const NETWORK_CONFIG: Record<SuiNetwork, SuiNetworkConfig> = {
  testnet: {
    packageId: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    sharesTradingObjectId: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
    fullnodeUrl: 'https://fullnode.testnet.sui.io',
  },
  mainnet: {
    packageId: '0xMAINNET_PACKAGE_ID',
    sharesTradingObjectId: '0xMAINNET_SHARES_TRADING_OBJECT_ID',
    fullnodeUrl: 'https://fullnode.mainnet.sui.io',
  },
  devnet: {
    packageId: '0xDEVNET_PACKAGE_ID',
    sharesTradingObjectId: '0xDEVNET_SHARES_TRADING_OBJECT_ID',
    fullnodeUrl: 'https://fullnode.devnet.sui.io',
  },
};

export const CURRENT_NETWORK: SuiNetwork = (process.env.NEXT_PUBLIC_SUI_NETWORK as SuiNetwork) || 'testnet';
export const CURRENT_NETWORK_CONFIG = NETWORK_CONFIG[CURRENT_NETWORK]; 