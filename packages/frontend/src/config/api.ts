// Sui Testnet configuration. To switch to mainnet, update .env.local and restart the server.
export const WEB3_CONFIG = {
  // shares_trading packageId
  packageId: process.env.NEXT_PUBLIC_SUI_PACKAGE_ID!,

  // shares_trading Admin Object ID
  adminObjectId: process.env.NEXT_PUBLIC_SUI_ADMIN_OBJECT_ID!,

  // UpgradeCap Object ID
  upgradeCapObjectId: process.env.NEXT_PUBLIC_SUI_UPGRADE_CAP_OBJECT_ID!,

  // Sui RPC endpoint
  endpoint: process.env.NEXT_PUBLIC_SUI_ENDPOINT!
}; 