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

// 以下为原 app/config/network.ts 的变量
export const CONTRACT_PACKAGE_ID_NOT_DEFINED = '0xNOTDEFINED';
export const LOCALNET_CONTRACT_PACKAGE_ID =
  process.env.NEXT_PUBLIC_LOCALNET_CONTRACT_PACKAGE_ID ||
  CONTRACT_PACKAGE_ID_NOT_DEFINED;
export const DEVNET_CONTRACT_PACKAGE_ID =
  process.env.NEXT_PUBLIC_DEVNET_CONTRACT_PACKAGE_ID ||
  CONTRACT_PACKAGE_ID_NOT_DEFINED;
export const TESTNET_CONTRACT_PACKAGE_ID =
  process.env.NEXT_PUBLIC_TESTNET_CONTRACT_PACKAGE_ID ||
  CONTRACT_PACKAGE_ID_NOT_DEFINED;
export const MAINNET_CONTRACT_PACKAGE_ID =
  process.env.NEXT_PUBLIC_MAINNET_CONTRACT_PACKAGE_ID ||
  CONTRACT_PACKAGE_ID_NOT_DEFINED;

export const LOCALNET_EXPLORER_URL = 'http://localhost:9001';
export const DEVNET_EXPLORER_URL = 'https://devnet.suivision.xyz';
export const TESTNET_EXPLORER_URL = 'https://testnet.suivision.xyz';
export const MAINNET_EXPLORER_URL = 'https://suivision.xyz';

export const CONTRACT_PACKAGE_VARIABLE_NAME = 'contractPackageId';
export const EXPLORER_URL_VARIABLE_NAME = 'explorerUrl';
export const NETWORKS_WITH_FAUCET = ['localnet', 'devnet', 'testnet']; 