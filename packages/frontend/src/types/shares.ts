// Shares related types for Sui on-chain logic
// All comments and variable names are in English for clarity

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

// NetworkContractConfig type declaration (see contract.ts for actual usage)
export interface NetworkContractConfig {
  packageId: string;
  sharesTradingObjectId: string;
  suiClient: unknown; // SuiClient type
} 