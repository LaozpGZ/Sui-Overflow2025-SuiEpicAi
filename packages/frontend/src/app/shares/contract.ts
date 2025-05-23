// import { parseEther } from 'viem'; // Removed EVM specific import
import { WEB3_CONFIG } from '@/config/api'; // Assuming API_CONFIG has web3 related configs
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'; // Import Sui Client
import { Transaction } from '@mysten/sui/transactions'; // Import Transaction builder
import { ENetwork } from '@/types/ENetwork';
import { validateAddress, parseAmount, toBigIntSafe } from './utils/contractUtils';
import { CURRENT_NETWORK_CONFIG } from '@/config/network';
// import useNetworkConfig from '@/hooks/useNetworkConfig'; // Moved network config logic elsewhere
// import { 
//   CONTRACT_PACKAGE_VARIABLE_NAME,
// } from '@/config/network'; // Moved network config logic elsewhere

// Contract Configuration
export const MODULE_NAME = 'shares_trading';

// Function to get the Package ID
// **TODO: Get the actual Package ID based on the connected network dynamically**
// For now, using hardcoded Testnet ID based on user input.
// 这里直接用常量或配置文件管理 packageId
export const SUI_PACKAGE_ID = CURRENT_NETWORK_CONFIG.packageId;

// **TODO: Define how to get the SharesTrading Object ID**
// This ID is needed as the first argument for entry functions like buy_shares/sell_shares
// It might be in WEB3_CONFIG, another env var, or fetched dynamically (e.g., by type).
// Example placeholder - **Verify this path in your config or find where it's defined**:
export const SHARES_TRADING_OBJECT_ID = CURRENT_NETWORK_CONFIG.sharesTradingObjectId; 

// -------------------- Type Declarations --------------------
export interface NetworkContractConfig {
  packageId: string;
  sharesTradingObjectId: string;
  suiClient: SuiClient;
}

export interface SharesSupplyResult {
  supply: bigint;
}

export interface SharesBalanceResult {
  balance: bigint;
}

export interface PriceEstimationResult {
  price: bigint;
}

/**
 * Build a Transaction for the buy_shares entry function.
 * @param subjectAddress The subject address.
 * @param amount The amount to buy.
 * @param estimatedPrice The estimated price.
 * @returns Transaction
 */
export function getBuySharesParams(subjectAddress: string, amount: string, estimatedPrice: string): Transaction {
  const tx = new Transaction();
  const packageId = String(SUI_PACKAGE_ID);
  const sharesTradingObjectId = String(SHARES_TRADING_OBJECT_ID);

  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(estimatedPrice))]);

  tx.moveCall({
    target: `${packageId}::${MODULE_NAME}::buy_shares`,
    arguments: [
      tx.object(sharesTradingObjectId),
      tx.pure.address(validateAddress(subjectAddress)),
      tx.pure.u64(parseAmount(amount)),
      paymentCoin,
    ],
  });

  return tx;
}

/**
 * Build a Transaction for the sell_shares entry function.
 * @param subjectAddress The subject address.
 * @param amount The amount to sell.
 * @returns Transaction
 */
export function getSellSharesParams(subjectAddress: string, amount: string): Transaction {
  const tx = new Transaction();
  const packageId = String(SUI_PACKAGE_ID);
  const sharesTradingObjectId = String(SHARES_TRADING_OBJECT_ID);

  tx.moveCall({
    target: `${packageId}::${MODULE_NAME}::sell_shares`,
    arguments: [
      tx.object(sharesTradingObjectId),
      tx.pure.address(validateAddress(subjectAddress)),
      tx.pure.u64(parseAmount(amount)),
    ],
  });

  return tx;
}

// -------------------- Transaction Parameter Builders --------------------

/**
 * Build a Transaction for buying shares with custom config.
 * @param config Network contract config.
 * @param subjectAddress The subject address.
 * @param amount The amount to buy.
 * @param estimatedPrice The estimated price.
 * @returns Transaction
 */
export function getBuySharesTx(
  config: NetworkContractConfig,
  subjectAddress: string,
  amount: string,
  estimatedPrice: string
): Transaction {
  const tx = new Transaction();
  const { packageId, sharesTradingObjectId } = config;
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(BigInt(estimatedPrice))]);
  tx.moveCall({
    target: `${String(packageId)}::${MODULE_NAME}::buy_shares`,
    arguments: [
      tx.object(String(sharesTradingObjectId)),
      tx.pure.address(validateAddress(subjectAddress)),
      tx.pure.u64(parseAmount(amount)),
      paymentCoin,
    ],
  });
  return tx;
}

/**
 * Build a Transaction for selling shares with custom config.
 * @param config Network contract config.
 * @param subjectAddress The subject address.
 * @param amount The amount to sell.
 * @returns Transaction
 */
export function getSellSharesTx(
  config: NetworkContractConfig,
  subjectAddress: string,
  amount: string
): Transaction {
  const tx = new Transaction();
  const { packageId, sharesTradingObjectId } = config;
  tx.moveCall({
    target: `${String(packageId)}::${MODULE_NAME}::sell_shares`,
    arguments: [
      tx.object(String(sharesTradingObjectId)),
      tx.pure.address(validateAddress(subjectAddress)),
      tx.pure.u64(parseAmount(amount)),
    ],
  });
  return tx;
}

// -------------------- On-chain Query Parameter Builders & Utilities --------------------

// Price estimation parameters (for useSuiClientQuery)
export function getPriceEstimationParams(
  config: NetworkContractConfig,
  mode: 'buy' | 'sell',
  subjectAddress: string,
  amount: string
) {
  const { packageId, sharesTradingObjectId } = config;
  const functionName = mode === 'buy' ? 'get_buy_price_after_fee' : 'get_sell_price_after_fee';
  return {
    package: packageId,
    module: MODULE_NAME,
    function: functionName,
    arguments: [
      sharesTradingObjectId,
      validateAddress(subjectAddress),
      parseAmount(amount),
    ],
  };
} 