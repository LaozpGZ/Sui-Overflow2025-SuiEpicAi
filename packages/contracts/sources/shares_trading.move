module shares_trading::shares_trading {
    use sui::object::{Self, ID, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use sui::event;
    use sui::table::{Self, Table};
    use std::option::{Self, Option};

    // Error codes
    const EInsufficientPayment: u64 = 0;
    const EOnlySubjectCanBuyFirstShare: u64 = 1;
    const ECannotSellLastShare: u64 = 2;
    const EInsufficientShares: u64 = 3;
    const ETransferFailed: u64 = 4;
    const EInsufficientLiquidity: u64 = 5;

    // Constants
    const BASIS_POINTS: u64 = 10000;
    const PROTOCOL_FEE_PERCENT: u64 = 500; // 5%
    const SUBJECT_FEE_PERCENT: u64 = 500; // 5%

    // Events
    struct Trade has copy, drop {
        trader: address,
        subject: address,
        is_buy: bool,
        amount: u64,
        price: u64,
        protocol_fee: u64,
        subject_fee: u64,
        supply: u64,
    }

    // Platform administrator
    struct Admin has key {
        id: UID,
        protocol_fee_destination: address,
    }

    // Main contract
    struct SharesTrading has key {
        id: UID,
        // Total supply of shares for each subject
        shares_supply: Table<address, u64>,
        // User's shares balance (subject -> (owner -> balance))
        shares_balance: Table<address, Table<address, u64>>,
        // Protocol fees balance
        protocol_fee_balance: Balance<SUI>,
        // Liquidity pool
        liquidity_pool: Balance<SUI>,
    }

    // Initialization function
    fun init(ctx: &mut TxContext) {
        let admin = Admin {
            id: object::new(ctx),
            protocol_fee_destination: tx_context::sender(ctx),
        };

        let shares_trading = SharesTrading {
            id: object::new(ctx),
            shares_supply: table::new(ctx),
            shares_balance: table::new(ctx),
            protocol_fee_balance: balance::zero(),
            liquidity_pool: balance::zero(),
        };

        transfer::share_object(shares_trading);
        transfer::transfer(admin, tx_context::sender(ctx));
    }

    // Function to calculate price (using the sum of squares pricing formula)
    // Return value is in MIST (1 SUI = 10^9 MIST)
    fun get_price(supply: u64, amount: u64): u64 {
        // Handle edge cases
        if (supply == 0 && amount == 1) {
            return 0
        };
        
        // Calculate sum1: (supply-1)*(supply)*(2*(supply-1)+1)/6
        let sum1 = if (supply == 0) {
            0
        } else {
            let s_minus_1 = supply - 1;
            let s = supply;
            let numerator = s_minus_1 * s * (2 * s_minus_1 + 1);
            numerator / 6
        };
        
        // Calculate sum2: (supply-1+amount)*(supply+amount)*(2*(supply-1+amount)+1)/6
        let s_minus_1_plus_a = if (supply == 0) { amount - 1 } else { supply - 1 + amount };
        let s_plus_a = supply + amount;
        let numerator = s_minus_1_plus_a * s_plus_a * (2 * s_minus_1_plus_a + 1);
        let sum2 = numerator / 6;
        
        // Calculate summation (sum2 - sum1) and apply scaling factor
        let summation = sum2 - sum1;
        
        // Define MIST precision constant (1 SUI = 10^9 MIST)
        let mist_precision = 1000000000; // 10^9
        
        // Multiply by MIST precision factor before dividing by scaling factor to ensure price is in MIST
        (summation * mist_precision) / 16
    }

    // Calculate the price to buy shares (excluding fees), return value is in MIST
    public fun get_buy_price(shares_trading: &SharesTrading, shares_subject: address, amount: u64): u64 {
        let supply = if (table::contains(&shares_trading.shares_supply, shares_subject)) {
            *table::borrow(&shares_trading.shares_supply, shares_subject)
        } else {
            0
        };
        
        get_price(supply, amount)
    }

    // Calculate the price to sell shares (excluding fees), return value is in MIST
    public fun get_sell_price(shares_trading: &SharesTrading, shares_subject: address, amount: u64): u64 {
        assert!(table::contains(&shares_trading.shares_supply, shares_subject), EInsufficientShares);
        let supply = *table::borrow(&shares_trading.shares_supply, shares_subject);
        assert!(supply > amount, ECannotSellLastShare);
        
        get_price(supply - amount, amount)
    }

    // Calculate the total price to buy shares (including fees), return value is in MIST
    public fun get_buy_price_after_fee(shares_trading: &SharesTrading, shares_subject: address, amount: u64): u64 {
        let price = get_buy_price(shares_trading, shares_subject, amount);
        let protocol_fee = price * PROTOCOL_FEE_PERCENT / BASIS_POINTS;
        let subject_fee = price * SUBJECT_FEE_PERCENT / BASIS_POINTS;
        
        price + protocol_fee + subject_fee
    }

    // Calculate the amount received after selling shares (after deducting fees), return value is in MIST
    public fun get_sell_price_after_fee(shares_trading: &SharesTrading, shares_subject: address, amount: u64): u64 {
        let price = get_sell_price(shares_trading, shares_subject, amount);
        let protocol_fee = price * PROTOCOL_FEE_PERCENT / BASIS_POINTS;
        let subject_fee = price * SUBJECT_FEE_PERCENT / BASIS_POINTS;
        
        price - protocol_fee - subject_fee
    }

    // Buy shares
    public entry fun buy_shares(
        shares_trading: &mut SharesTrading,
        shares_subject: address,
        amount: u64,
        payment: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Check if shares_subject exists in shares_supply
        let supply = if (table::contains(&shares_trading.shares_supply, shares_subject)) {
            *table::borrow(&shares_trading.shares_supply, shares_subject)
        } else {
            // If not, initialize to 0
            table::add(&mut shares_trading.shares_supply, shares_subject, 0);
            0
        };
        
        // Only the subject can buy the first share
        assert!(supply > 0 || shares_subject == sender, EOnlySubjectCanBuyFirstShare);
        
        // Calculate price and fees (unit: MIST)
        let price = get_price(supply, amount);
        let protocol_fee = price * PROTOCOL_FEE_PERCENT / BASIS_POINTS;
        let subject_fee = price * SUBJECT_FEE_PERCENT / BASIS_POINTS;
        let total_cost = price + protocol_fee + subject_fee;
        
        // Check if payment is sufficient
        assert!(coin::value(&payment) >= total_cost, EInsufficientPayment);
        
        // Update shares balance
        if (!table::contains(&shares_trading.shares_balance, shares_subject)) {
            table::add(&mut shares_trading.shares_balance, shares_subject, table::new(ctx));
        };
        
        let balances = table::borrow_mut(&mut shares_trading.shares_balance, shares_subject);
        
        if (!table::contains(balances, sender)) {
            table::add(balances, sender, 0);
        };
        
        let user_balance = table::borrow_mut(balances, sender);
        *user_balance = *user_balance + amount;
        
        // Update supply
        let supply_ref = table::borrow_mut(&mut shares_trading.shares_supply, shares_subject);
        *supply_ref = *supply_ref + amount;
        
        // Process payment
        let paid = coin::split(&mut payment, total_cost, ctx);
        let paid_balance = coin::into_balance(paid);
        
        // Withdraw protocol fee
        let protocol_fee_balance = balance::split(&mut paid_balance, protocol_fee);
        balance::join(&mut shares_trading.protocol_fee_balance, protocol_fee_balance);
        
        // Withdraw subject fee and transfer to shares_subject
        let subject_fee_coin = coin::from_balance(balance::split(&mut paid_balance, subject_fee), ctx);
        transfer::public_transfer(subject_fee_coin, shares_subject);
        
        // Add remaining amount to the liquidity pool
        balance::join(&mut shares_trading.liquidity_pool, paid_balance);
        
        // Return remaining coins to sender
        transfer::public_transfer(payment, sender);
        
        // Emit event
        event::emit(Trade {
            trader: sender,
            subject: shares_subject,
            is_buy: true,
            amount,
            price,
            protocol_fee,
            subject_fee,
            supply: *supply_ref,
        });
    }

    // Sell shares
    public entry fun sell_shares(
        shares_trading: &mut SharesTrading,
        shares_subject: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        // Get current supply
        assert!(table::contains(&shares_trading.shares_supply, shares_subject), EInsufficientShares);
        let supply = *table::borrow(&shares_trading.shares_supply, shares_subject);
        
        // Cannot sell the last share
        assert!(supply > amount, ECannotSellLastShare);
        
        // Check if the user has enough shares
        assert!(table::contains(&shares_trading.shares_balance, shares_subject), EInsufficientShares);
        let balances = table::borrow_mut(&mut shares_trading.shares_balance, shares_subject);
        
        assert!(table::contains(balances, sender), EInsufficientShares);
        let user_balance = table::borrow_mut(balances, sender);
        assert!(*user_balance >= amount, EInsufficientShares);
        
        // Calculate price and fees (unit: MIST)
        let price = get_price(supply - amount, amount);
        let protocol_fee = price * PROTOCOL_FEE_PERCENT / BASIS_POINTS;
        let subject_fee = price * SUBJECT_FEE_PERCENT / BASIS_POINTS;
        let seller_amount = price - protocol_fee - subject_fee;
        
        // Check if the liquidity pool has sufficient funds
        assert!(balance::value(&shares_trading.liquidity_pool) >= price, EInsufficientLiquidity);
        
        // Update user balance
        *user_balance = *user_balance - amount;
        
        // Update supply
        let supply_ref = table::borrow_mut(&mut shares_trading.shares_supply, shares_subject);
        *supply_ref = *supply_ref - amount;
        
        // Withdraw funds from the liquidity pool
        // Withdraw the amount due to the seller
        let seller_coin = coin::from_balance(balance::split(&mut shares_trading.liquidity_pool, seller_amount), ctx);
        transfer::public_transfer(seller_coin, sender);
        
        // Withdraw protocol fee
        let protocol_fee_balance = balance::split(&mut shares_trading.liquidity_pool, protocol_fee);
        balance::join(&mut shares_trading.protocol_fee_balance, protocol_fee_balance);
        
        // Withdraw subject fee and transfer to shares_subject
        let subject_fee_coin = coin::from_balance(balance::split(&mut shares_trading.liquidity_pool, subject_fee), ctx);
        transfer::public_transfer(subject_fee_coin, shares_subject);
        
        // Emit event
        event::emit(Trade {
            trader: sender,
            subject: shares_subject,
            is_buy: false,
            amount,
            price,
            protocol_fee,
            subject_fee,
            supply: *supply_ref,
        });
    }

    // Withdraw protocol fees
    public entry fun withdraw_protocol_fees(
        shares_trading: &mut SharesTrading,
        admin: &Admin,
        ctx: &mut TxContext
    ) {
        let protocol_fee_amount = balance::value(&shares_trading.protocol_fee_balance);
        let protocol_fee_coin = coin::take(&mut shares_trading.protocol_fee_balance, protocol_fee_amount, ctx);
        transfer::public_transfer(protocol_fee_coin, admin.protocol_fee_destination);
    }

    // Update protocol fee destination
    public entry fun update_protocol_fee_destination(
        admin: &mut Admin,
        new_destination: address,
        _ctx: &mut TxContext
    ) {
        admin.protocol_fee_destination = new_destination;
    }

    // Add liquidity
    public entry fun add_liquidity(
        shares_trading: &mut SharesTrading,
        payment: &mut Coin<SUI>,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(coin::value(payment) >= amount, EInsufficientPayment);
        let liquidity = coin::split(payment, amount, ctx);
        balance::join(&mut shares_trading.liquidity_pool, coin::into_balance(liquidity));
    }

    // Get current supply for a subject
    public fun get_current_supply(shares_trading: &SharesTrading, subject: address): u64 {
        if (table::contains(&shares_trading.shares_supply, subject)) {
            *table::borrow(&shares_trading.shares_supply, subject)
        } else {
            0
        }
    }

    // Get the user's shares balance
    public fun get_shares_balance(shares_trading: &SharesTrading, subject: address, user: address): u64 {
        if (!table::contains(&shares_trading.shares_balance, subject)) {
            return 0
        };
        
        let balances = table::borrow(&shares_trading.shares_balance, subject);
        
        if (!table::contains(balances, user)) {
            return 0
        };
        
        *table::borrow(balances, user)
    }

    #[test_only]
    /// Initialization function for testing only
    public fun init_for_testing(ctx: &mut TxContext) {
        init(ctx)
    }
} 