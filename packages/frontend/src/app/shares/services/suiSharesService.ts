import { SuiClient } from '@mysten/sui/client';
// import { type SuiTransport, type SuiTransportRequestOptions, type SuiTransportSubscribeOptions, type HttpHeaders, type SuiHTTPTransportOptions, SuiHTTPTransport, } from './http-transport.js';
import { Share, SharesBalanceResult, SharesSupplyResult, PriceEstimationResult } from '../types';
import { CURRENT_NETWORK_CONFIG } from '@/config/network';
import { Transaction } from '@mysten/sui/transactions';

// Initialize SuiClient
const suiClient = new SuiClient({ url: 'https://fullnode.testnet.sui.io:443' });
// Use constants or config files to manage required config (such as packageId, objectId)

// Get all shares list from on-chain
export async function getSharesList(): Promise<Share[]> {
  try {
    const fields = await suiClient.getDynamicFields({
      parentId: CURRENT_NETWORK_CONFIG.sharesTradingObjectId,
    });
    const shares: Share[] = [];
    for (const field of fields.data) {
      const subjectAddress = field.name.value as string;
      // Fetch supply for each subject
      let supplyResult: SharesSupplyResult = { supply: 0n };
      try {
        supplyResult = await getSharesSupply(subjectAddress);
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
export async function getShareDetail(subjectAddress: string): Promise<Share | null> {
  try {
    const supplyResult = await getSharesSupply(subjectAddress);
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
export async function getSharesBalance(subjectAddress: string, userAddress: string): Promise<SharesBalanceResult> {
  try {
    const subjectField = await suiClient.getDynamicFieldObject({
      parentId: CURRENT_NETWORK_CONFIG.sharesTradingObjectId,
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
  } catch (err) {
    console.error('[getSharesBalance] On-chain query failed:', err);
    return { balance: 0n };
  }
}

// Get shares supply for a subject
export async function getSharesSupply(subjectAddress: string): Promise<SharesSupplyResult> {
  try {
    const resp = await suiClient.getDynamicFieldObject({
      parentId: CURRENT_NETWORK_CONFIG.sharesTradingObjectId,
      name: { type: 'address', value: subjectAddress },
    });
    const value = (resp?.data?.content as any)?.fields?.value;
    return { supply: value ? BigInt(value) : 0n };
  } catch (err) {
    console.error('[getSharesSupply] On-chain query failed:', err);
    return { supply: 0n };
  }
}

// Estimate price for buying shares (including fee)
export async function estimateSharePrice(subjectAddress: string, amount: number): Promise<PriceEstimationResult> {
  console.log('[estimateSharePrice] called with:', {
    subjectAddress,
    amount,
    packageId: CURRENT_NETWORK_CONFIG.packageId,
    sharesTradingObjectId: CURRENT_NETWORK_CONFIG.sharesTradingObjectId,
    fullnodeUrl: CURRENT_NETWORK_CONFIG.fullnodeUrl,
  });
  try {
    // Construct PTB
    const tx = new Transaction();
    tx.moveCall({
      target: `${CURRENT_NETWORK_CONFIG.packageId}::shares_trading::get_buy_price_after_fee`,
      arguments: [
        tx.pure.address(CURRENT_NETWORK_CONFIG.sharesTradingObjectId),
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