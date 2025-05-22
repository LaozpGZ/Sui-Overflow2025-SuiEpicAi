export interface Share {
  subject_address: string;
  shares_amount: string;
}

export interface SharesBalanceResult {
  balance: bigint;
}

export interface SharesSupplyResult {
  supply: bigint;
}

export interface PriceEstimationResult {
  price: bigint;
} 