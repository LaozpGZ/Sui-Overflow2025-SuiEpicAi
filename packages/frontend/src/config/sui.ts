/**
 * All Sui contract and object IDs must be configured in .env file.
 * Never hardcode any on-chain ID in code!
 */
export const SUI_PACKAGE_ID = process.env.NEXT_PUBLIC_SUI_PACKAGE_ID!;
export const SUI_UPGRADE_CAP_ID = process.env.NEXT_PUBLIC_SUI_UPGRADE_CAP_ID!;
export const SUI_ADMIN_OBJECT_ID = process.env.NEXT_PUBLIC_SUI_ADMIN_OBJECT_ID!;

export const SUI_CONFIG = {
  packageId: process.env.NEXT_PUBLIC_PACKAGE_ID!,
  sharesTradingObjectId: process.env.NEXT_PUBLIC_SHARES_TRADING_OBJECT_ID!,
  adminId: process.env.NEXT_PUBLIC_ADMIN_ID!,
  upgradeCapId: process.env.NEXT_PUBLIC_UPGRADE_CAP_ID!,
  anotherObjectId: process.env.NEXT_PUBLIC_ANOTHER_OBJECT_ID!,
}; 