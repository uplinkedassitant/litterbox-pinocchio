//! Constants for LitterBox v2

/// Minimum deposit amount (1 USDC with 6 decimals)
pub const MIN_DEPOSIT_USDC: u64 = 1_000_000;

/// Minimum sweep amount (0.1 USDC with 6 decimals)
pub const MIN_SWEEP_USDC: u64 = 100_000;

/// Platform fee in basis points (200 = 2%)
pub const PLATFORM_FEE_BPS: u16 = 200;

/// Seed for Config account PDA
pub const CONFIG_SEED: &[u8] = b"config";

/// Seed for VirtualPool account PDA
pub const VIRTUAL_POOL_SEED: &[u8] = b"virtual_pool";

/// Seed for USDC vault PDA
pub const USDC_VAULT_SEED: &[u8] = b"usdc_vault";

/// Seed for LITTER vault PDA
pub const LITTER_VAULT_SEED: &[u8] = b"litter_vault";

/// Virtual pool mode
pub const MODE_VIRTUAL: u8 = 0;

/// Real pool mode (Raydium LP)
pub const MODE_REAL: u8 = 1;

// Jupiter Aggregator v6 Program ID
/// JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4
pub const JUPITER_V6_PROGRAM: [u8; 32] = [
    0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f,
    0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f, 0x5f,
];
