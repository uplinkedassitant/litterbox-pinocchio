//! Math helpers and PDA derivation.

use pinocchio::{
    program_error::ProgramError,
    pubkey::{Pubkey, find_program_address},
};

use crate::{error::LitterError, PLATFORM_FEE_BPS};

// ── bonding curve ─────────────────────────────────────────────────────────────

/// Constant-product virtual AMM:
///   litter_out = (virtual_litter × usdc_in) / (virtual_usdc + usdc_in)
///
/// Intermediate arithmetic is done in u128 to avoid overflow on large reserves.
pub fn calc_litter_out(
    virtual_usdc:   u64,
    virtual_litter: u64,
    usdc_in:        u64,
) -> Result<u64, ProgramError> {
    let num = (virtual_litter as u128)
        .checked_mul(usdc_in as u128)
        .ok_or(LitterError::Overflow)?;
    let den = (virtual_usdc as u128)
        .checked_add(usdc_in as u128)
        .ok_or(LitterError::Overflow)?;
    let out = num.checked_div(den).ok_or(LitterError::Overflow)?;
    u64::try_from(out).map_err(|_| LitterError::Overflow.into())
}

/// Returns `(fee, amount_after_fee)` for the platform fee in basis points.
pub fn split_fee(amount: u64) -> Result<(u64, u64), ProgramError> {
    let fee = amount
        .checked_mul(PLATFORM_FEE_BPS)
        .ok_or(LitterError::Overflow)?
        .checked_div(10_000)
        .ok_or(LitterError::Overflow)?;
    let net = amount.checked_sub(fee).ok_or(LitterError::Overflow)?;
    Ok((fee, net))
}

// ── PDA derivation ────────────────────────────────────────────────────────────

pub fn config_pda(program_id: &Pubkey) -> (Pubkey, u8) {
    find_program_address(&[crate::CONFIG_SEED], program_id)
}

pub fn pool_pda(litter_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    find_program_address(
        &[crate::VIRTUAL_POOL_SEED, litter_mint],
        program_id,
    )
}

pub fn usdc_vault_pda(litter_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    find_program_address(
        &[crate::USDC_VAULT_SEED, litter_mint],
        program_id,
    )
}

pub fn litter_vault_pda(litter_mint: &Pubkey, program_id: &Pubkey) -> (Pubkey, u8) {
    find_program_address(
        &[crate::LITTER_VAULT_SEED, litter_mint],
        program_id,
    )
}
