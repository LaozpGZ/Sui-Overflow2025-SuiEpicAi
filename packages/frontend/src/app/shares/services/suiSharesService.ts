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
    const subjectTableId = (subjectFieldObj?.data?.content as any)?.fields?.value?.fields?.id?.id;
    if (!subjectTableId) return { balance: 0n };
    // 3. Get userField
    const userFields = await suiClient.getDynamicFields({ parentId: subjectTableId });
    const userField = userFields.data.find(f => f.name.value === userAddress);
    if (!userField) return { balance: 0n };
    // 4. Get userField object content, extract balance
    const userFieldObj = await suiClient.getObject({ id: userField.objectId });
    const value = (userFieldObj?.data?.content as any)?.fields?.value;
    return { balance: value ? BigInt(value) : 0n };
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
    const value = (subjectFieldObj?.data?.content as any)?.fields?.value;
    return { supply: value ? BigInt(value) : 0n };
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
  const value = (resp?.data?.content as any)?.fields?.value;
  return { supply: value ? BigInt(value) : 0n };
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
  const subjectTableId = (subjectField?.data?.content as any)?.fields?.value?.fields?.id?.id;
  if (!subjectTableId) return { balance: 0n };
  const userField = await suiClient.getDynamicFieldObject({
    parentId: subjectTableId,
    name: { type: 'address', value: userAddress },
  });
  const value = (userField?.data?.content as any)?.fields?.value;
  return { balance: value ? BigInt(value) : 0n };
} 