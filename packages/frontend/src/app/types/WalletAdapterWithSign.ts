export interface WalletAdapterWithSign {
  signAndExecuteTransactionBlock: (args: { transaction: unknown }) => Promise<unknown>;
} 