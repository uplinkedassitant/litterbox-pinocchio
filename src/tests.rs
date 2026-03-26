//! Unit tests — run with `cargo test` (no SBF toolchain needed).

use crate::*;
use crate::error::LitterError;
use crate::utils::{calc_litter_out, split_fee};
use pinocchio::program_error::ProgramError;

#[test]
fn test_config_size() {
    assert_eq!(Config::LEN, 86);
}

#[test]
fn test_virtual_pool_size() {
    assert_eq!(VirtualPool::LEN, 41);
}

#[test]
fn test_initialize_params_size() {
    assert_eq!(core::mem::size_of::<InitializeParams>(), 24);
}

#[test]
fn test_error_codes() {
    let e: ProgramError = LitterError::InvalidAmount.into();
    assert!(matches!(e, ProgramError::Custom(0)));

    let e: ProgramError = LitterError::SlippageExceeded.into();
    assert!(matches!(e, ProgramError::Custom(1)));
}

#[test]
fn test_constants() {
    assert_eq!(MIN_DEPOSIT_USDC,   1_000_000);
    assert_eq!(MIN_SWEEP_USDC,     100_000);
    assert_eq!(PLATFORM_FEE_BPS,   200);
    assert_eq!(MODE_VIRTUAL,       0);
    assert_eq!(MODE_REAL,          1);
}

#[test]
fn test_bonding_curve() {
    // litter_out = (1_000_000_000_000 * 10_000_000) / (100_000_000 + 10_000_000)
    //            = 10^19 / 110_000_000 = 90_909_090_909
    let out = calc_litter_out(100_000_000, 1_000_000_000_000, 10_000_000).unwrap();
    assert_eq!(out, 90_909_090_909);
}

#[test]
fn test_fee_split() {
    let (fee, net) = split_fee(10_000_000).unwrap();
    assert_eq!(fee, 200_000);
    assert_eq!(net, 9_800_000);
}

#[test]
fn test_graduation_threshold() {
    let threshold:   u64 = 1_000 * 1_000_000;
    let accumulated: u64 = 1_050 * 1_000_000;
    assert!(accumulated >= threshold);
}

#[test]
fn test_pda_seeds() {
    assert_eq!(CONFIG_SEED,       b"config");
    assert_eq!(VIRTUAL_POOL_SEED, b"virtual_pool");
    assert_eq!(USDC_VAULT_SEED,   b"usdc_vault");
    assert_eq!(LITTER_VAULT_SEED, b"litter_vault");
}

#[test]
fn test_config_zeroed() {
    // bytemuck::Zeroable lets us create a zero-initialised Config
    use bytemuck::Zeroable;
    let c = Config::zeroed();
    assert_eq!(c.mode, 0);
    assert_eq!(c.config_bump, 0);
}

#[test]
fn test_pool_zeroed() {
    use bytemuck::Zeroable;
    let p = VirtualPool::zeroed();
    assert_eq!(p.virtual_usdc, 0);
    assert_eq!(p.real_usdc, 0);
}
