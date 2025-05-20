## Overview

Shares Trading is a decentralized protocol inspired by Friend.tech, allowing users to buy and sell "shares" tied to specific addresses (subjects). The price of shares follows a quadratic bonding curve, meaning the price increases exponentially with each share purchased.

## Key Features

- Buy and sell shares of any address
- Automatically calculated prices using bonding curve formula
- Liquidity pool to facilitate trading
- Protocol fees for sustainability
- Admin functions for protocol management

## Contract Methods

### Public Methods

#### `buy_shares(subject: address, amount: u64)`
- **Description**: Purchase shares of a specific subject
- **Parameters**:
  - `subject`: The address of the subject whose shares you want to buy
  - `amount`: Number of shares to purchase
- **Returns**: The total cost in SUI for the purchase
- **Note**: Price increases quadratically with each share purchased

#### `sell_shares(subject: address, amount: u64)`
- **Description**: Sell shares of a specific subject
- **Parameters**:
  - `subject`: The address of the subject whose shares you want to sell
  - `amount`: Number of shares to sell
- **Returns**: The amount of SUI received from the sale
- **Note**: Sale price follows the same bonding curve formula

#### `get_price(supply: u64, amount: u64)`
- **Description**: Calculate the price for a specific amount of shares
- **Parameters**:
  - `supply`: Current supply of shares
  - `amount`: Number of shares to calculate price for
- **Returns**: The price in SUI
- **Note**: Uses the formula: price = sum(supply^2 - (supply+amount)^2)

#### `get_shares_balance(owner: address, subject: address)`
- **Description**: Get the number of shares an owner has for a specific subject
- **Parameters**:
  - `owner`: The address of the share owner
  - `subject`: The subject address
- **Returns**: Number of shares owned

### Admin Methods

#### `add_liquidity(amount: u64)`
- **Description**: Add liquidity to the protocol's trading pool
- **Parameters**:
  - `amount`: Amount of SUI to add as liquidity
- **Returns**: None
- **Note**: Requires admin permission

#### `withdraw_protocol_fees(admin_cap: &AdminCap)`
- **Description**: Withdraw accumulated protocol fees
- **Parameters**:
  - `admin_cap`: Admin capability object
- **Returns**: Amount of SUI withdrawn
- **Note**: Requires admin permission

#### `set_protocol_fee_percent(admin_cap: &AdminCap, fee_percent: u64)`
- **Description**: Update the protocol fee percentage
- **Parameters**:
  - `admin_cap`: Admin capability object
  - `fee_percent`: New fee percentage (basis points)
- **Returns**: None
- **Note**: Requires admin permission

## Interaction Script

This repository contains a script for interacting with the deployed Shares Trading contract.

### Installation

```bash
npm install @mysten/sui.js
```

### Usage

1. Open `interact_with_shares_trading.ts` file
2. Fill in your private key (Base64 format) in the `privateKeyB64` variable
3. Uncomment the operation you want to execute
4. Run the script:

```bash
# If you have ts-node installed
ts-node interact_with_shares_trading.ts

# Or using npx
npx ts-node interact_with_shares_trading.ts
```

### Examples

#### Buy Shares
```typescript
// Buy 1 share of subject 0x123... for 1 SUI
await buyShares(signer, '0x123...', 1, 1000000000); // 1 SUI = 1,000,000,000 MIST
```

#### Sell Shares
```typescript
// Sell 1 share of subject 0x123...
await sellShares(signer, '0x123...', 1);
```

#### Add Liquidity (Admin Only)
```typescript
// Add 1 SUI as liquidity
await addLiquidity(signer, 1000000000);
```

#### Withdraw Protocol Fees (Admin Only)
```typescript
// Withdraw protocol fees using Admin capability
await withdrawProtocolFees(signer, 'admin_object_id');
```

### Notes

- Ensure your wallet has sufficient SUI tokens
- Buying shares and adding liquidity requires paying SUI
- Protocol fee withdrawal and liquidity addition require admin permission
- Admin object ID needs to be queried from the chain 