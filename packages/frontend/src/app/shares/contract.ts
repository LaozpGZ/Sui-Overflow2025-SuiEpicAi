// import { parseEther } from 'viem'; // Removed EVM specific import
import { WEB3_CONFIG } from '@/config/api'; // Assuming API_CONFIG has web3 related configs
import { Transaction } from '@mysten/sui/transactions'; // Import Transaction builder
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'; // Import Sui Client
import { ENetwork } from '@/types/ENetwork';
import { validateAddress, parseAmount, toBigIntSafe } from './utils/contractUtils';
// import useNetworkConfig from '@/hooks/useNetworkConfig'; // Moved network config logic elsewhere
// import { 
//   CONTRACT_PACKAGE_VARIABLE_NAME,
// } from '@/config/network'; // Moved network config logic elsewhere

// Contract Configuration
export const MODULE_NAME = 'shares_trading'; // From shares_trading.move

// Function to get the Package ID
// **TODO: Get the actual Package ID based on the connected network dynamically**
// For now, using hardcoded Testnet ID based on user input.
export const PACKAGE_ID = '0xd08d2d8f0c7df418dbc038e6a03c7e6e19ca73b49bf1bd279c4440d511a65edd'; 

// **TODO: Define how to get the SharesTrading Object ID**
// This ID is needed as the first argument for entry functions like buy_shares/sell_shares
// It might be in WEB3_CONFIG, another env var, or fetched dynamically (e.g., by type).
// Example placeholder - **Verify this path in your config or find where it's defined**:
export const SHARES_TRADING_OBJECT_ID = WEB3_CONFIG.SHARES_TRADING_OBJECT_ID; 

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

// Build a Transaction for the buy_shares entry function
// Needs SharesTrading object ID, shares_subject address, amount, and payment coin
export function getBuySharesParams(subjectAddress: string, amount: string, estimatedPrice: string): Transaction {
  const tx = new Transaction();
  // Package ID is a constant for now, but should be dynamic
  const packageId = PACKAGE_ID;
  const sharesTradingObjectId = SHARES_TRADING_OBJECT_ID; // Use the object ID

  // **TODO: Correctly handle SUI coin payment in TransactionBlock**
  // You need to get the sender's SUI coin and split/transfer the required amount (estimatedPrice)
  // This often involves selecting a coin from the sender's account
  
  // Example (may need adjustment based on coin management strategy):
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure(BigInt(estimatedPrice))]); // Assuming tx.gas is the primary coin
  

  tx.moveCall({
    target: `${packageId}::${MODULE_NAME}::buy_shares`,
    arguments: [
      tx.object(sharesTradingObjectId), // SharesTrading object ID (shared object)
      tx.pure(validateAddress(subjectAddress)), // shares_subject: address
      tx.pure(parseAmount(amount)), // amount: u64
      paymentCoin, // payment: Coin<SUI>
    ],
  });

  return tx; // Return the built TransactionBlock
}

// Build a Transaction for the sell_shares entry function
// Needs SharesTrading object ID, shares_subject address, and amount
export function getSellSharesParams(subjectAddress: string, amount: string): Transaction {
   const tx = new Transaction();
   // Package ID is a constant for now, but should be dynamic
   const packageId = PACKAGE_ID;
   const sharesTradingObjectId = SHARES_TRADING_OBJECT_ID; // Use the object ID

  tx.moveCall({
     target: `${packageId}::${MODULE_NAME}::sell_shares`,
     arguments: [
       tx.object(sharesTradingObjectId), // SharesTrading object ID (shared object)
       tx.pure(validateAddress(subjectAddress)), // shares_subject: address
       tx.pure(parseAmount(amount)), // amount: u64
     ],
   });

   return tx; // Return the built TransactionBlock
}

// -------------------- Transaction Parameter Builders --------------------

export function getBuySharesTx(
  config: NetworkContractConfig,
  subjectAddress: string,
  amount: string,
  estimatedPrice: string
): Transaction {
  const tx = new Transaction();
  const { packageId, sharesTradingObjectId } = config;
  const [paymentCoin] = tx.splitCoins(tx.gas, [tx.pure(BigInt(estimatedPrice))]);
  tx.moveCall({
    target: `${packageId}::${MODULE_NAME}::buy_shares`,
    arguments: [
      tx.object(sharesTradingObjectId),
      tx.pure(validateAddress(subjectAddress)),
      tx.pure(parseAmount(amount)),
      paymentCoin,
    ],
  });
  return tx;
}

export function getSellSharesTx(
  config: NetworkContractConfig,
  subjectAddress: string,
  amount: string
): Transaction {
  const tx = new Transaction();
  const { packageId, sharesTradingObjectId } = config;
  tx.moveCall({
    target: `${packageId}::${MODULE_NAME}::sell_shares`,
    arguments: [
      tx.object(sharesTradingObjectId),
      tx.pure(validateAddress(subjectAddress)),
      tx.pure(parseAmount(amount)),
    ],
  });
  return tx;
}

// -------------------- On-chain Query Parameter Builders & Utilities --------------------

// fetchSharesSupply
export async function fetchSharesSupply(
  config: NetworkContractConfig,
  subjectAddress: string
): Promise<SharesSupplyResult> {
  const { suiClient, sharesTradingObjectId } = config;
  // Sui dynamic field query
  const resp = await suiClient.getDynamicFieldObject({
    parentId: sharesTradingObjectId,
    name: { type: 'address', value: validateAddress(subjectAddress) },
  });
  // The value is in resp.data.content.fields.value
  const value = (resp?.data?.content as any)?.fields?.value;
  return { supply: toBigIntSafe(value) };
}

// fetchSharesBalance
export async function fetchSharesBalance(
  config: NetworkContractConfig,
  subjectAddress: string,
  userAddress: string
): Promise<SharesBalanceResult> {
  const { suiClient, sharesTradingObjectId } = config;
  // 1. Query subject -> Table<address, u64> objectId
  const subjectField = await suiClient.getDynamicFieldObject({
    parentId: sharesTradingObjectId,
    name: { type: 'address', value: validateAddress(subjectAddress) },
  });
  const subjectTableId = (subjectField?.data?.content as any)?.fields?.value?.fields?.id?.id;
  if (!subjectTableId) return { balance: 0n };
  // 2. Query user -> u64
  const userField = await suiClient.getDynamicFieldObject({
    parentId: subjectTableId,
    name: { type: 'address', value: validateAddress(userAddress) },
  });
  const value = (userField?.data?.content as any)?.fields?.value;
  return { balance: toBigIntSafe(value) };
}

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