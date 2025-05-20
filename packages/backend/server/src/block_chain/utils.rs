use ethers::{
    prelude::*,
    utils::hash_message,
};
use ethers::utils::hex;

// Verify signature
pub fn verify_signature(
    challenge: &str,
    signature: &str,
) -> Result<Address, String> {
    let sig_bytes = hex::decode(signature)
        .map_err(|e| format!("Invalid signature hex: {}", e))?;

    if sig_bytes.len() != 65 {
        return Err("Signature must be 65 bytes".into());
    }

    let message_hash = hash_message(challenge);
    let signature = Signature::try_from(sig_bytes.as_slice()).map_err(|e| format!("Invalid signature: {}!",e))?;
    let recovered_address = signature
        .recover(message_hash)
        .map_err(|e| format!("Recovery failed: {}", e))?;
    Ok(recovered_address)
}

// Define Trade event structure
#[derive(Debug, EthEvent)]
#[ethevent(
    name = "Trade",
    abi = "Trade(address trader, address subject, bool isBuy, uint256 shareAmount, uint256 ethAmount, uint256 protocolEthAmount, uint256 subjectEthAmount, uint256 supply)"
)]
pub struct TradeEvent {
    // #[ethevent(indexed)]
    pub trader: Address,
    // #[ethevent(indexed)]
    pub subject: Address,
    pub is_buy: bool,
    pub share_amount: U256,
    pub eth_amount: U256,
    pub protocol_eth_amount: U256,
    pub subject_eth_amount: U256,
    pub supply: U256,
}

// ABI constants
pub const ABI: &str = r#"[	{
    "inputs": [
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        },
        {
            "internalType": "address",
            "name": "",
            "type": "address"
        }
    ],
    "name": "sharesBalance",
    "outputs": [
        {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
        }
    ],
    "stateMutability": "view",
    "type": "function"
}]"#;

pub const TRADE_ABI: &str = r#"[{
    "anonymous": false,
    "inputs": [
        {
            "indexed": false,
            "internalType": "address",
            "name": "trader",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "address",
            "name": "subject",
            "type": "address"
        },
        {
            "indexed": false,
            "internalType": "bool",
            "name": "isBuy",
            "type": "bool"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "shareAmount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "ethAmount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "protocolEthAmount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "subjectEthAmount",
            "type": "uint256"
        },
        {
            "indexed": false,
            "internalType": "uint256",
            "name": "supply",
            "type": "uint256"
        }
    ],
    "name": "Trade",
    "type": "event"
}]"#;

#[cfg(test)]
mod tests {
    use super::*;
    use ethers::utils::keccak256;
    
    #[test]
    fn test_keccak256_hash() {
        // Prepare test data
        let input = "Trade(address,address,bool,uint256,uint256,uint256,uint256,uint256)";
        
        // Execute keccak256 hash
        let hash_result = keccak256(input.as_bytes());
        
        // Convert result to hex string for verification
        let hash_hex = hex::encode(hash_result);
        println!("{hash_hex}")
        
        // // Expected hash value (can be verified with other tools)
        // let expected_hex = "f45f5e9619efb8a2a6600b6f7e382a4e141f7a9668a8c242c38232a43e433a01";
        //
        // // Assert hash result matches expected
        // assert_eq!(hash_hex, expected_hex);
        //
        // // Test empty string
        // let empty_hash = hex::encode(keccak256("".as_bytes()));
        // let expected_empty = "c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470";
        // assert_eq!(empty_hash, expected_empty);
    }
} 