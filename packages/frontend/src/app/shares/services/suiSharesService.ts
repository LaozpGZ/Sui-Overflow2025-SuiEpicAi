import { Share, SharesBalanceResult, SharesSupplyResult, PriceEstimationResult } from '../types';
import { Transaction } from '@mysten/sui/transactions';
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';

// Create a global SuiClient instance for all on-chain queries
export const suiClient = new SuiClient({ url: getFullnodeUrl('mainnet') }); // You can change 'mainnet' to your target network

// Get all shares list from on-chain
export async function getSharesList(sharesTradingObjectId: string): Promise<Share[]> {
  try {
    const fields = await suiClient.getDynamicFields({
      parentId: sharesTradingObjectId,
    });
    const shares: Share[] = [];
    for (const field of fields.data) {
      const subjectAddress = field.name.value as string;
      // Fetch supply for each subject
      let supplyResult: SharesSupplyResult = { supply: 0n };
      try {
        supplyResult = await getSharesSupply(sharesTradingObjectId, subjectAddress);
      } catch (err) {
        console.error('[getSharesList] getSharesSupply error:', err);
      }
      shares.push({
        subject_address: subjectAddress,
        shares_amount: supplyResult.supply.toString(),
      });
    }
    return shares;
  } catch (err) {
    console.error('[getSharesList] On-chain query failed:', err);
    return [];
  }
}

// Get share detail by subject address from on-chain
export async function getShareDetail(sharesTradingObjectId: string, subjectAddress: string): Promise<Share | null> {
  try {
    const supplyResult = await getSharesSupply(sharesTradingObjectId, subjectAddress);
    return {
      subject_address: subjectAddress,
      shares_amount: supplyResult.supply.toString(),
    };
  } catch (err) {
    console.error('[getShareDetail] On-chain query failed:', err);
    return null;
  }
}

// Get shares balance for a user
export async function getSharesBalance(sharesTradingObjectId: string, subjectAddress: string, userAddress: string): Promise<SharesBalanceResult> {
  try {
    // 1. Get subjectField
    const subjectFields = await suiClient.getDynamicFields({ parentId: sharesTradingObjectId });
    const subjectField = subjectFields.data.find(f => f.name.value === subjectAddress);
    if (!subjectField) return { balance: 0n };
    // 2. Get subjectField object content, extract subjectTableId
    const subjectFieldObj = await suiClient.getObject({ id: subjectField.objectId });
    let subjectTableId: string | undefined;
    const subjectContent = subjectFieldObj?.data?.content as Record<string, unknown>;
    if (subjectContent && typeof subjectContent === 'object' && 'fields' in subjectContent) {
      const fields = subjectContent.fields;
      if (fields && typeof fields === 'object' && 'value' in fields) {
        const value = fields.value;
        if (value && typeof value === 'object' && 'fields' in value) {
          const idObj = value.fields;
          if (idObj && typeof idObj === 'object' && 'id' in idObj) {
            const id = idObj.id;
            subjectTableId = getInnerId(id);
          }
        }
      }
    }
    if (!subjectTableId) return { balance: 0n };
    // 3. Get userField
    const userFields = await suiClient.getDynamicFields({ parentId: subjectTableId });
    const userField = userFields.data.find(f => f.name.value === userAddress);
    if (!userField) return { balance: 0n };
    // 4. Get userField object content, extract balance
    const userFieldObj = await suiClient.getObject({ id: userField.objectId });
    let value: unknown;
    const userContent = userFieldObj?.data?.content as Record<string, unknown>;
    if (userContent && typeof userContent === 'object' && 'fields' in userContent) {
      const fields = userContent.fields;
      if (fields && typeof fields === 'object' && 'value' in fields) {
        value = fields.value;
      }
    }
    return { balance: value ? BigInt(value as string) : 0n };
  } catch (err) {
    console.error('[getSharesBalance] On-chain query failed:', err);
    return { balance: 0n };
  }
}

// Get shares supply for a subject
export async function getSharesSupply(sharesTradingObjectId: string, subjectAddress: string): Promise<SharesSupplyResult> {
  try {
    // 1. Get subjectField
    const subjectFields = await suiClient.getDynamicFields({ parentId: sharesTradingObjectId });
    const subjectField = subjectFields.data.find(f => f.name.value === subjectAddress);
    if (!subjectField) return { supply: 0n };
    // 2. Get subjectField object content, extract supply
    const subjectFieldObj = await suiClient.getObject({ id: subjectField.objectId });
    let value: unknown;
    const subjectContent = subjectFieldObj?.data?.content as Record<string, unknown>;
    if (subjectContent && typeof subjectContent === 'object' && 'fields' in subjectContent) {
      const fields = subjectContent.fields;
      if (fields && typeof fields === 'object' && 'value' in fields) {
        value = fields.value;
      }
    }
    return { supply: value ? BigInt(value as string) : 0n };
  } catch (err) {
    console.error('[getSharesSupply] On-chain query failed:', err);
    return { supply: 0n };
  }
}

// Estimate price for buying shares (including fee)
export async function estimateSharePrice(packageId: string, sharesTradingObjectId: string, subjectAddress: string, amount: number): Promise<PriceEstimationResult> {
  console.log('[estimateSharePrice] called with:', {
    subjectAddress,
    amount,
    packageId,
    sharesTradingObjectId,
  });
  try {
    // Construct PTB
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::shares_trading::get_buy_price_after_fee`,
      arguments: [
        tx.pure.address(sharesTradingObjectId),
        tx.pure.address(subjectAddress),
        tx.pure.u64(amount),
      ],
    });
    // Use devInspectTransactionBlock for simulation
    const resp = await suiClient.devInspectTransactionBlock({
      sender: '0x0', // For simulation only, sender can be arbitrary
      transactionBlock: tx,
    });
    console.log('[estimateSharePrice] devInspectTransactionBlock resp:', resp);
    // Parse return value
    const results = resp.results?.[0]?.returnValues?.[0];
    if (!results) throw new Error('No return value from devInspectTransactionBlock');
    // returnValues: [value, typeTag]
    const price = BigInt(results[0][0]);
    return { price };
  } catch (err) {
    console.error('[estimateSharePrice] Error:', err);
    return { price: 0n };
  }
}

// Query the shares supply for a given subject
export async function fetchSharesSupply(
  sharesTradingObjectId: string,
  subjectAddress: string
): Promise<SharesSupplyResult> {
  const resp = await suiClient.getDynamicFieldObject({
    parentId: sharesTradingObjectId,
    name: { type: 'address', value: subjectAddress },
  });
  let value: unknown;
  const content = resp?.data?.content as Record<string, unknown>;
  if (content && typeof content === 'object' && 'fields' in content) {
    const fields = content.fields;
    if (fields && typeof fields === 'object' && 'value' in fields) {
      value = fields.value;
    }
  }
  return { supply: value ? BigInt(value as string) : 0n };
}

// Query the shares balance for a user under a given subject
export async function fetchSharesBalance(
  sharesTradingObjectId: string,
  subjectAddress: string,
  userAddress: string
): Promise<SharesBalanceResult> {
  const subjectField = await suiClient.getDynamicFieldObject({
    parentId: sharesTradingObjectId,
    name: { type: 'address', value: subjectAddress },
  });
  let subjectTableId: string | undefined;
  const subjectContent = subjectField?.data?.content as Record<string, unknown>;
  if (subjectContent && typeof subjectContent === 'object' && 'fields' in subjectContent) {
    const fields = subjectContent.fields;
    if (fields && typeof fields === 'object' && 'value' in fields) {
      const value = fields.value;
      if (value && typeof value === 'object' && 'fields' in value) {
        const idObj = value.fields;
        if (idObj && typeof idObj === 'object' && 'id' in idObj) {
          const id = idObj.id;
          subjectTableId = getInnerId(id);
        }
      }
    }
  }
  if (!subjectTableId) return { balance: 0n };
  const userField = await suiClient.getDynamicFieldObject({
    parentId: subjectTableId,
    name: { type: 'address', value: userAddress },
  });
  let value: unknown;
  const userContent = userField?.data?.content as Record<string, unknown>;
  if (userContent && typeof userContent === 'object' && 'fields' in userContent) {
    const fields = userContent.fields;
    if (fields && typeof fields === 'object' && 'value' in fields) {
      value = fields.value;
    }
  }
  return { balance: value ? BigInt(value as string) : 0n };
}

/**
 * Get the total shares supply for a given subject from the on-chain Table.
 * @param sharesTradingObjectId The objectId of the SharesTrading contract instance
 * @param subjectAddress The address of the subject whose shares supply you want to query
 * @returns The shares supply as a number
 * @throws Error if shares_supply table or value not found
 *
 * Example usage in React:
 *   const supply = await getSubjectSupply(sharesTradingObjectId, subjectAddress);
 */
export async function getSubjectSupply(
  sharesTradingObjectId: string,
  subjectAddress: string
): Promise<number> {
  try {
    // 1. Fetch the SharesTrading contract object
    const sharesTradingObj = await suiClient.getObject({
      id: sharesTradingObjectId,
      options: { showContent: true }
    });
    // 2. Extract the shares_supply Table objectId
    const content = sharesTradingObj?.data?.content as Record<string, unknown>;
    let sharesSupplyTableId: unknown;
    if (content && typeof content === 'object' && 'fields' in content) {
      const fields = content.fields;
      if (fields && typeof fields === 'object' && 'shares_supply' in fields) {
        sharesSupplyTableId = fields.shares_supply;
      }
    }
    if (!sharesSupplyTableId) throw new Error('shares_supply not found');
    // 3. Query the Table for the subject's supply
    const supplyObj = await suiClient.getDynamicFieldObject({
      parentId: sharesSupplyTableId as string,
      name: { type: 'address', value: subjectAddress }
    });
    let supplyValue: unknown;
    const supplyContent = supplyObj?.data?.content as Record<string, unknown>;
    if (supplyContent && typeof supplyContent === 'object' && 'fields' in supplyContent) {
      const fields = supplyContent.fields;
      if (fields && typeof fields === 'object' && 'value' in fields) {
        supplyValue = fields.value;
      }
    }
    return Number(supplyValue);
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch subject supply');
  }
}

// 获取所有 subject 列表（兼容原 useAllSubjects 逻辑）
export async function getAllSubjects(sharesTradingObjectId: string): Promise<string[]> {
  try {
    const sharesTradingObj = await suiClient.getObject({
      id: sharesTradingObjectId,
      options: { showContent: true }
    });
    const content = sharesTradingObj?.data?.content as Record<string, unknown>;
    let sharesSupplyTableId: unknown;
    if (content && typeof content === 'object' && 'fields' in content) {
      const fields = content.fields;
      if (fields && typeof fields === 'object' && 'shares_supply' in fields) {
        sharesSupplyTableId = fields.shares_supply;
      }
    }
    if (!sharesSupplyTableId) {
      // Throw a more user-friendly error with troubleshooting instructions
      throw new Error(
        `shares_supply not found! The contract objectId (${sharesTradingObjectId}) is invalid or not initialized on-chain.\n` +
        `Please check your environment variable and contract deployment.\n` +
        `1. Make sure NEXT_PUBLIC_XXX_SHARES_TRADING_OBJECT_ID is set to the correct on-chain SharesTrading objectId.\n` +
        `2. Use suiexplorer to inspect the object and ensure it contains the shares_supply field.\n` +
        `3. Ensure the contract was initialized with the init function after deployment.`
      );
    }
    const subjects = await suiClient.getDynamicFields({ parentId: sharesSupplyTableId as string });
    return (subjects.data as { name: { value: string } }[]).map(item => item.name.value);
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch subjects');
  }
}

// 获取买入价格（带 fee），兼容 useBuyPriceAfterFee
export async function getBuyPriceAfterFee(
  packageId: string,
  sharesTradingObjectId: string,
  subjectAddress: string,
  amount: number
): Promise<number> {
  try {
    const tx = new Transaction();
    tx.moveCall({
      target: `${packageId}::shares_trading::get_buy_price_after_fee`,
      arguments: [
        tx.pure.address(sharesTradingObjectId),
        tx.pure.address(subjectAddress),
        tx.pure.u64(amount),
      ],
    });
    const resp = await suiClient.devInspectTransactionBlock({
      sender: '0x0',
      transactionBlock: tx,
    });
    const results = resp.results?.[0]?.returnValues?.[0];
    if (!results) throw new Error('No return value from devInspectTransactionBlock');
    return Number(results[0][0]);
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch buy price after fee');
  }
}

// 获取 SUI 余额，兼容 useSuiBalance
export async function getSuiBalance(address: string): Promise<bigint> {
  try {
    const coins = await suiClient.getCoins({
      owner: address,
      coinType: '0x2::sui::SUI',
    });
    const total = coins.data.reduce((sum: bigint, coin: { balance: string }) => sum + BigInt(coin.balance), 0n);
    return total;
  } catch (e: unknown) {
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch SUI balance');
  }
}

/**
 * Example React component usage:
 *
 * import { useSubjectSupply } from '../hooks/useSubjectSupply';
 *
 * function SupplyDisplay({ sharesTradingObjectId, subjectAddress }) {
 *   const { data: supply, loading, error } = useSubjectSupply(sharesTradingObjectId, subjectAddress);
 *   if (loading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error}</div>;
 *   return <div>Current shares supply: {supply}</div>;
 * }
 */

// Helper type guard to extract inner id
function getInnerId(id: unknown): string | undefined {
  if (typeof id === 'string') return id;
  if (id && typeof id === 'object' && 'id' in id && typeof (id as { id: unknown }).id === 'string') {
    return (id as { id: string }).id;
  }
  return undefined;
} 