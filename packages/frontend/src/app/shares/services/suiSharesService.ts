import { SuiKit } from '@suiware/kit';
import { SuiClient } from '@mysten/sui.js/client';
import { Share, SharesBalanceResult, SharesSupplyResult, PriceEstimationResult } from '../types';

// Initialize SuiClient
const suiKit = new SuiKit({ networkType: 'testnet' });
const SUI_CONFIG = suiKit.config;
const suiClient = new SuiClient({ url: process.env.NEXT_PUBLIC_SUI_RPC_URL! });

// Get all shares list from on-chain
export async function getSharesList(): Promise<Share[]> {
  // Fetch all dynamic fields under the shares_supply table
  const fields = await suiClient.getDynamicFields({
    parentId: SUI_CONFIG.sharesTradingObjectId,
  });
  const shares: Share[] = [];
  for (const field of fields.data) {
    const subjectAddress = field.name.value;
    // Fetch supply for each subject
    const supplyResult = await getSharesSupply(subjectAddress);
    shares.push({
      subject_address: subjectAddress,
      shares_amount: supplyResult.supply.toString(),
    });
  }
  return shares;
}

// Get share detail by subject address from on-chain
export async function getShareDetail(subjectAddress: string): Promise<Share | null> {
  const supplyResult = await getSharesSupply(subjectAddress);
  return {
    subject_address: subjectAddress,
    shares_amount: supplyResult.supply.toString(),
  };
}

// Get shares balance for a user
export async function getSharesBalance(subjectAddress: string, userAddress: string): Promise<SharesBalanceResult> {
  const subjectField = await suiClient.getDynamicFieldObject({
    parentId: SUI_CONFIG.sharesTradingObjectId,
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

// Get shares supply for a subject
export async function getSharesSupply(subjectAddress: string): Promise<SharesSupplyResult> {
  const resp = await suiClient.getDynamicFieldObject({
    parentId: SUI_CONFIG.sharesTradingObjectId,
    name: { type: 'address', value: subjectAddress },
  });
  const value = (resp?.data?.content as any)?.fields?.value;
  return { supply: value ? BigInt(value) : 0n };
}

// Estimate price for buying shares (including fee)
export async function estimateSharePrice(subjectAddress: string, amount: number): Promise<PriceEstimationResult> {
  const resp = await suiClient.callMoveFunction({
    package: SUI_CONFIG.packageId,
    module: 'shares_trading',
    function: 'get_buy_price_after_fee',
    arguments: [
      SUI_CONFIG.sharesTradingObjectId,
      subjectAddress,
      amount,
    ],
  });
  // Assume the result is in resp.results[0]
  return { price: BigInt(resp.results[0]) };
} 