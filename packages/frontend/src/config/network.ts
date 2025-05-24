// Sui network config for different environments
export type SuiNetwork = 'testnet' | 'mainnet' | 'devnet' | 'localnet';

export interface SuiNetworkConfig {
  packageId: string;
  sharesTradingObjectId?: string;
  fullnodeUrl: string;
  explorerUrl: string;
}

export const NETWORK_CONFIG: Record<SuiNetwork, SuiNetworkConfig> = {
  testnet: {
    packageId: process.env.NEXT_PUBLIC_TESTNET_PACKAGE_ID || '0xNOT_SET',
    sharesTradingObjectId: process.env.NEXT_PUBLIC_TESTNET_SHARES_TRADING_OBJECT_ID || '0xNOT_SET',
    fullnodeUrl: 'https://fullnode.testnet.sui.io',
    explorerUrl: 'https://testnet.suivision.xyz',
  },
  mainnet: {
    packageId: process.env.NEXT_PUBLIC_MAINNET_PACKAGE_ID || '0xNOT_SET',
    sharesTradingObjectId: process.env.NEXT_PUBLIC_MAINNET_SHARES_TRADING_OBJECT_ID || '0xNOT_SET',
    fullnodeUrl: 'https://fullnode.mainnet.sui.io',
    explorerUrl: 'https://suivision.xyz',
  },
  devnet: {
    packageId: process.env.NEXT_PUBLIC_DEVNET_PACKAGE_ID || '0xNOT_SET',
    sharesTradingObjectId: process.env.NEXT_PUBLIC_DEVNET_SHARES_TRADING_OBJECT_ID || '0xNOT_SET',
    fullnodeUrl: 'https://fullnode.devnet.sui.io',
    explorerUrl: 'https://devnet.suivision.xyz',
  },
  localnet: {
    packageId: process.env.NEXT_PUBLIC_LOCALNET_CONTRACT_PACKAGE_ID || '0xNOT_SET',
    fullnodeUrl: 'http://localhost:9000',
    explorerUrl: 'http://localhost:9001',
  },
};

export const CURRENT_NETWORK: SuiNetwork =
  (process.env.NEXT_PUBLIC_SUI_NETWORK as SuiNetwork) || 'testnet';

export const CURRENT_NETWORK_CONFIG = NETWORK_CONFIG[CURRENT_NETWORK];

// 合约包 ID 统一管理
export const CONTRACT_PACKAGE_IDS: Record<SuiNetwork, string> = {
  testnet: NETWORK_CONFIG.testnet.packageId,
  mainnet: NETWORK_CONFIG.mainnet.packageId,
  devnet: NETWORK_CONFIG.devnet.packageId,
  localnet: NETWORK_CONFIG.localnet.packageId,
};

// 变量名常量
export const CONTRACT_PACKAGE_VARIABLE_NAME = 'contractPackageId';
export const EXPLORER_URL_VARIABLE_NAME = 'explorerUrl';

// 支持 faucet 的网络
export const NETWORKS_WITH_FAUCET: SuiNetwork[] = ['localnet', 'devnet', 'testnet']; 