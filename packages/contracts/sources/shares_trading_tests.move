#[test_only]
module shares_trading::shares_trading_tests {
    use sui::test_scenario::{Self, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::test_utils::assert_eq;
    use sui::object::{Self, ID};
    use sui::table::{Self, Table};
    use sui::tx_context::TxContext;
    use std::debug;
    
    use shares_trading::shares_trading::{Self, SharesTrading, Admin};

    // Test addresses
    const ADMIN: address = @0xAD;
    const SUBJECT: address = @0xAB;
    const USER1: address = @0xA1;
    const USER2: address = @0xA2;
    
    // Test initialization
    #[test]
    fun test_init() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize contract
        {
            shares_trading::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // Verify that Admin object has been created and transferred to ADMIN
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_for_sender<Admin>(&scenario), 0);
        };
        
        // Verify that SharesTrading object has been created and shared
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            assert!(test_scenario::has_most_recent_shared<SharesTrading>(), 0);
        };
        
        test_scenario::end(scenario);
    }
    
    // Test buying shares
    #[test]
    fun test_buy_shares() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize contract
        {
            shares_trading::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // SUBJECT buys the first share
        test_scenario::next_tx(&mut scenario, SUBJECT);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            // Mint enough coins, the price of the first share is 0, but still need enough to pay fees
            let coin = mint_sui(10000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::buy_shares(
                &mut shares_trading,
                SUBJECT,
                1, // Purchase 1 share
                coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(shares_trading);
        };
        
        // USER1 buys SUBJECT's shares
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            // Mint more coins, as price increases with supply
            let coin = mint_sui(100000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::buy_shares(
                &mut shares_trading,
                SUBJECT,
                2, // Purchase 2 shares
                coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(shares_trading);
        };
        
        // Add liquidity for later tests
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            let coin = mint_sui(10000000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::add_liquidity(
                &mut shares_trading,
                &mut coin,
                5000000000, // Add sufficient liquidity
                test_scenario::ctx(&mut scenario)
            );
            
            // Return remaining SUI
            transfer::public_transfer(coin, ADMIN);
            test_scenario::return_shared(shares_trading);
        };
        
        test_scenario::end(scenario);
    }
    
    // Test selling shares
    #[test]
    fun test_sell_shares() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize contract
        {
            shares_trading::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // SUBJECT buys the first share
        test_scenario::next_tx(&mut scenario, SUBJECT);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            let coin = mint_sui(100000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::buy_shares(
                &mut shares_trading,
                SUBJECT,
                5, // Purchase 5 shares
                coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(shares_trading);
        };
        
        // Add liquidity for later tests
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            let coin = mint_sui(10000000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::add_liquidity(
                &mut shares_trading,
                &mut coin,
                5000000000, // Add sufficient liquidity
                test_scenario::ctx(&mut scenario)
            );
            
            // Return remaining SUI
            transfer::public_transfer(coin, ADMIN);
            test_scenario::return_shared(shares_trading);
        };
        
        // USER1 buys SUBJECT's shares
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            let coin = mint_sui(1000000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::buy_shares(
                &mut shares_trading,
                SUBJECT,
                2, // Purchase 2 shares
                coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(shares_trading);
        };
        
        // USER1 sells SUBJECT's shares
        test_scenario::next_tx(&mut scenario, USER1);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            
            shares_trading::sell_shares(
                &mut shares_trading,
                SUBJECT,
                1, // Sell 1 share
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(shares_trading);
        };
        
        test_scenario::end(scenario);
    }
    
    // Test withdrawing protocol fees
    #[test]
    fun test_withdraw_protocol_fees() {
        let scenario = test_scenario::begin(ADMIN);
        
        // Initialize contract
        {
            shares_trading::init_for_testing(test_scenario::ctx(&mut scenario));
        };
        
        // SUBJECT buys the first share
        test_scenario::next_tx(&mut scenario, SUBJECT);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            let coin = mint_sui(100000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::buy_shares(
                &mut shares_trading,
                SUBJECT,
                5, // Purchase 5 shares
                coin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(shares_trading);
        };
        
        // Add liquidity
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            let coin = mint_sui(10000000000, test_scenario::ctx(&mut scenario));
            
            shares_trading::add_liquidity(
                &mut shares_trading,
                &mut coin,
                5000000000, // Add sufficient liquidity
                test_scenario::ctx(&mut scenario)
            );
            
            // Return remaining SUI
            transfer::public_transfer(coin, ADMIN);
            test_scenario::return_shared(shares_trading);
        };
        
        // Admin withdraws protocol fees
        test_scenario::next_tx(&mut scenario, ADMIN);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            let admin = test_scenario::take_from_sender<Admin>(&scenario);
            
            shares_trading::withdraw_protocol_fees(
                &mut shares_trading,
                &admin,
                test_scenario::ctx(&mut scenario)
            );
            
            test_scenario::return_shared(shares_trading);
            test_scenario::return_to_sender(&scenario, admin);
        };
        
        test_scenario::end(scenario);
    }
    
    // Test price calculations
    #[test]
    fun test_price_calculations() {
        let scenario = test_scenario::begin(ADMIN);

        // Initialize contract
        {
            shares_trading::init_for_testing(test_scenario::ctx(&mut scenario));
        };

        // Test price calculations
        test_scenario::next_tx(&mut scenario, SUBJECT);
        {
            let shares_trading = test_scenario::take_shared<SharesTrading>(&scenario);
            
            // Test that the price of the first share should be 0
            let subject_new = @0xABC;
            let price = shares_trading::get_buy_price(&shares_trading, subject_new, 1);
            assert_eq(price, 0);
            
            // Test that price increases with quantity
            let price_1 = shares_trading::get_buy_price(&shares_trading, subject_new, 1);
            let price_2 = shares_trading::get_buy_price(&shares_trading, subject_new, 2);
            // Since the first share is specially processed as 0, buying 2 is at least not cheaper than buying 1
            assert!(price_2 >= price_1, 0);
            
            // Test purchase prices under different supply
            let subject_has_some = SUBJECT;
            
            // Get current supply
            let current_supply = shares_trading::get_current_supply(&shares_trading, subject_has_some);
            // Confirm initial supply is 0
            assert_eq(current_supply, 0);
            
            // Check the output of the price calculation function
            // Note: We check prices first, then perform actual purchase
            let initial_price_1 = shares_trading::get_buy_price(&shares_trading, subject_has_some, 1);
            debug::print(&initial_price_1);
            let initial_price_2 = shares_trading::get_buy_price(&shares_trading, subject_has_some, 1);
            // When buying a larger quantity, the price is at least not lower
            assert!(initial_price_2 >= initial_price_1, 0);
            
            // Create some shares for subject_has_some
            let coin = mint_sui(1000000000, test_scenario::ctx(&mut scenario));
            shares_trading::buy_shares(
                &mut shares_trading,
                subject_has_some,
                1, // Purchase 1 share
                coin,
                test_scenario::ctx(&mut scenario)
            );
            
            // Verify that supply has increased
            let new_supply = shares_trading::get_current_supply(&shares_trading, subject_has_some);
            assert_eq(new_supply, 1);  // supply should increase from 0 to 1
            
            // Check price again after purchase, price should increase after supply increases
            let new_price_1 = shares_trading::get_buy_price(&shares_trading, subject_has_some, 1);
            debug::print(&new_price_1);
            // Confirm that new_price_1 should be greater than 0, as it's not the first share anymore
            assert!(new_price_1 > 0, 0);
            assert!(new_price_1 >= initial_price_1, 0);
            
            // Test price with fees
            let price_with_fee = shares_trading::get_buy_price_after_fee(&shares_trading, subject_has_some, 1);
            // Price plus fees should be greater than the original price
            assert!(price_with_fee > new_price_1, 0);
            
            // Test selling price
            let sell_price = shares_trading::get_sell_price(&shares_trading, subject_has_some, 1);
            let sell_price_with_fee = shares_trading::get_sell_price_after_fee(&shares_trading, subject_has_some, 1);
            
            // Selling price should be less than or equal to purchase price (due to price curve)
            assert!(sell_price <= new_price_1, 0);
            
            // Selling price after deducting fees should be less than the original selling price
            assert!(sell_price_with_fee < sell_price, 0);

            test_scenario::return_shared(shares_trading);
        };
        
        test_scenario::end(scenario);
    }
    
    // Helper function: mint SUI tokens
    fun mint_sui(amount: u64, ctx: &mut TxContext): Coin<SUI> {
        coin::mint_for_testing<SUI>(amount, ctx)
    }
} 