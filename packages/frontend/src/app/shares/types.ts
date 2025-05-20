export type Share = {
  subject_address: string;
  shares_amount: string;
};

export type TradeMode = 'buy' | 'sell';

export interface SharesSupplyResult {
  supply: bigint;
}

export interface SharesBalanceResult {
  balance: bigint;
}

export interface PriceEstimationResult {
  price: bigint;
}

// NetworkContractConfig 类型声明（实际定义见 contract.ts）
export interface NetworkContractConfig {
  packageId: string;
  sharesTradingObjectId: string;
  suiClient: any; // SuiClient type
} 