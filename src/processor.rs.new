//! Instruction dispatcher and per-instruction handlers.

use bytemuck::{Zeroable, Pod};

use pinocchio::{
    account_info::AccountInfo,
    program_error::ProgramError,
    pubkey::{Pubkey, find_program_address},
    ProgramResult,
};

use crate::{
    error::LitterError,
    instruction::{disc, parse_amount, parse_deposit, parse_initialize},
    state::{Config, VirtualPool},
    utils::{calc_litter_out, split_fee},
    {MIN_DEPOSIT_USDC, MIN_SWEEP_USDC, MODE_REAL, MODE_VIRTUAL},
};

use pinocchio_system::instructions::CreateAccount;

// ── entry ─────────────────────────────────────────────────────────────────────

pub fn process_instruction(
    program_id: &Pubkey,
    accounts:   &[AccountInfo],
    data:       &[u8],
) -> ProgramResult {
    let (discriminator, rest) = data
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;

    match *discriminator {
        disc::INITIALIZE => process_initialize(program_id, accounts, rest),
        disc::DEPOSIT    => process_deposit(program_id, accounts, rest),
        disc::SWEEP      => process_sweep(program_id, accounts, rest),
        disc::GRADUATE   => process_graduate(program_id, accounts, rest),
        disc::FLUSH      => process_flush(program_id, accounts, rest),
        _                => Err(ProgramError::InvalidInstructionData),
    }
}

// ── account helpers ───────────────────────────────────────────────────────────

#[inline(always)]
fn get(accounts: &[AccountInfo], index: usize) -> Result<&AccountInfo, ProgramError> {
    accounts.get(index).ok_or(ProgramError::NotEnoughAccountKeys)
}

/// Zero-copy load of a Pod type from an account's data (immutable).
/// `Ref<[u8]>` derefs to `&[u8]` so `bytemuck::from_bytes` can operate on it.
fn load<T: bytemuck::Pod>(info: &AccountInfo) -> Result<T, ProgramError> {
    let data = info.try_borrow_data()?;
    let size = core::mem::size_of::<T>();
    if data.len() < size {
        return Err(ProgramError::AccountDataTooSmall);
    }
    // Copy out via bytemuck — packed structs may be unaligned so we copy
    // rather than transmute to avoid UB on unaligned reads on non-SBF hosts.
    Ok(*bytemuck::from_bytes::<T>(&data[..size]))
}

/// Write a Pod value into account data.
fn store<T: bytemuck::Pod>(info: &AccountInfo, value: &T) -> ProgramResult {
    let mut data = info.try_borrow_mut_data()?;
    let size = core::mem::size_of::<T>();
    if data.len() < size {
        return Err(ProgramError::AccountDataTooSmall);
    }
    data[..size].copy_from_slice(bytemuck::bytes_of(value));
    Ok(())
}

// ── 0: initialize ─────────────────────────────────────────────────────────────
//
// Accounts:
//   0  authority    [signer, writable]
//   1  config       [writable]          Config PDA (pre-allocated by client)
//   2  virtual_pool [writable]          VirtualPool PDA (pre-allocated)
//   3  litter_mint  []                  SPL mint for LITTER

fn process_initialize(
    program_id: &Pubkey,
    accounts:   &[AccountInfo],
    data:       &[u8],
) -> ProgramResult {
    let authority   = get(accounts, 0)?;
    let config_acc  = get(accounts, 1)?;
    let pool_acc    = get(accounts, 2)?;
    let litter_mint = get(accounts, 3)?;

    if !authority.is_signer() {
        return Err(LitterError::MissingSigner.into());
    }
    if !config_acc.is_writable() || !pool_acc.is_writable() {
        return Err(ProgramError::InvalidArgument);
    }

    let params = parse_initialize(data)
        .ok_or(ProgramError::InvalidInstructionData)?;

    // Verify Config PDA address
    let (expected_config, config_bump) =
        find_program_address(&[crate::CONFIG_SEED], program_id);
    if config_acc.key() != &expected_config {
        return Err(ProgramError::InvalidArgument);
    }

    // Verify VirtualPool PDA address
    let (expected_pool, pool_bump) = find_program_address(
        &[crate::VIRTUAL_POOL_SEED, litter_mint.key()],
        program_id,
    );
    if pool_acc.key() != &expected_pool {
        return Err(ProgramError::InvalidArgument);
    }

    // Build and store Config
    let mut config = Config::zeroed();
    config.authority            = *authority.key();
    config.litter_mint          = *litter_mint.key();
    config.config_bump          = config_bump;
    config.mode                 = MODE_VIRTUAL;
    config.graduation_threshold = params.graduation_threshold;
    config.total_fees_collected = 0;
    store(config_acc, &config)?;

    // Build and store VirtualPool
    let mut pool = VirtualPool::zeroed();
    pool.virtual_usdc   = params.virtual_usdc;
    pool.virtual_litter = params.virtual_litter;
    pool.real_usdc      = 0;
    pool.pool_bump      = pool_bump;
    store(pool_acc, &pool)?;

    Ok(())
}

// ── 1: deposit ────────────────────────────────────────────────────────────────
//
// Accounts:
//   0  user         [signer]
//   1  config       []                  Config PDA (read)
//   2  virtual_pool [writable]          VirtualPool PDA

fn process_deposit(
    _program_id: &Pubkey,
    accounts:    &[AccountInfo],
    data:        &[u8],
) -> ProgramResult {
    let user       = get(accounts, 0)?;
    let config_acc = get(accounts, 1)?;
    let pool_acc   = get(accounts, 2)?;

    if !user.is_signer() {
        return Err(LitterError::MissingSigner.into());
    }
    if !pool_acc.is_writable() {
        return Err(ProgramError::InvalidArgument);
    }

    let params = parse_deposit(data).ok_or(ProgramError::InvalidInstructionData)?;

    if params.usdc_amount < MIN_DEPOSIT_USDC {
        return Err(LitterError::InvalidAmount.into());
    }

    let config: Config = load(config_acc)?;
    if config.mode != MODE_VIRTUAL {
        return Err(LitterError::InvalidMode.into());
    }

    let mut pool: VirtualPool = load(pool_acc)?;

    let (_, net_usdc) = split_fee(params.usdc_amount)?;

    let litter_out = calc_litter_out(pool.virtual_usdc, pool.virtual_litter, net_usdc)?;

    if litter_out < params.min_litter_out {
        return Err(LitterError::SlippageExceeded.into());
    }

    pool.virtual_usdc   = pool.virtual_usdc
        .checked_add(net_usdc)
        .ok_or(LitterError::Overflow)?;
    pool.virtual_litter = pool.virtual_litter
        .checked_sub(litter_out)
        .ok_or(LitterError::Overflow)?;
    pool.real_usdc      = pool.real_usdc
        .checked_add(net_usdc)
        .ok_or(LitterError::Overflow)?;

    store(pool_acc, &pool)?;

    // SPL token CPIs (usdc_vault ← user_usdc, user_litter ← litter_vault)
    // are wired in once pinocchio-token is added as a dependency.

    Ok(())
}

// ── 2: sweep ──────────────────────────────────────────────────────────────────
//
// Accounts:
//   0  authority    [signer]
//   1  config       [writable]

fn process_sweep(
    _program_id: &Pubkey,
    accounts:    &[AccountInfo],
    data:        &[u8],
) -> ProgramResult {
    let authority  = get(accounts, 0)?;
    let config_acc = get(accounts, 1)?;

    if !authority.is_signer() {
        return Err(LitterError::MissingSigner.into());
    }
    if !config_acc.is_writable() {
        return Err(ProgramError::InvalidArgument);
    }

    let params = parse_amount(data).ok_or(ProgramError::InvalidInstructionData)?;

    if params.amount < MIN_SWEEP_USDC {
        return Err(LitterError::InvalidAmount.into());
    }

    let mut config: Config = load(config_acc)?;

    // authority stored as [u8;32]; Pubkey is also [u8;32]
    if authority.key() != &config.authority {
        return Err(LitterError::InvalidAuthority.into());
    }

    config.total_fees_collected = config.total_fees_collected
        .checked_add(params.amount)
        .ok_or(LitterError::Overflow)?;

    store(config_acc, &config)?;

    // SPL token CPI: usdc_vault → fee_recipient  (accounts 2, 3, 4)

    Ok(())
}

// ── 3: graduate ───────────────────────────────────────────────────────────────
//
// Accounts:
//   0  authority    [signer]
//   1  config       [writable]
//   2  virtual_pool []

fn process_graduate(
    _program_id: &Pubkey,
    accounts:    &[AccountInfo],
    _data:       &[u8],
) -> ProgramResult {
    let authority  = get(accounts, 0)?;
    let config_acc = get(accounts, 1)?;
    let pool_acc   = get(accounts, 2)?;

    if !authority.is_signer() {
        return Err(LitterError::MissingSigner.into());
    }
    if !config_acc.is_writable() {
        return Err(ProgramError::InvalidArgument);
    }

    let mut config: Config = load(config_acc)?;

    if authority.key() != &config.authority {
        return Err(LitterError::InvalidAuthority.into());
    }
    if config.mode != MODE_VIRTUAL {
        return Err(LitterError::AlreadyGraduated.into());
    }

    let pool: VirtualPool = load(pool_acc)?;

    // graduation_threshold may be unaligned in packed struct — copy to stack first
    let threshold = config.graduation_threshold;
    if pool.real_usdc < threshold {
        return Err(LitterError::NotGraduated.into());
    }

    config.mode = MODE_REAL;
    store(config_acc, &config)?;

    Ok(())
}

// ── 4: flush ──────────────────────────────────────────────────────────────────
//
// Emergency drain — authority only.
//
// Accounts:
//   0  authority    [signer]
//   1  config       []

fn process_flush(
    _program_id: &Pubkey,
    accounts:    &[AccountInfo],
    _data:       &[u8],
) -> ProgramResult {
    let authority  = get(accounts, 0)?;
    let config_acc = get(accounts, 1)?;

    if !authority.is_signer() {
        return Err(LitterError::MissingSigner.into());
    }

    let config: Config = load(config_acc)?;

    if authority.key() != &config.authority {
        return Err(LitterError::InvalidAuthority.into());
    }

    // SPL token CPI: full usdc_vault balance → recipient  (accounts 2, 3, 4)

    Ok(())
}

// Helper function to get rent minimum
fn get_rent_minimum(space: usize) -> Result<u64, ProgramError> {
    // For simplicity, use a fixed rent calculation
    // In production, this should call the rent sysvar
    Ok(890880) // ~0.00089 SOL for minimal account
}

// Helper function to create account via CPI
fn create_account(
    pda: &Pubkey,
    program_id: &Pubkey,
    payer: &AccountInfo,
    system_program: &AccountInfo,
    seeds: &[&[u8]],
    bump: u8,
    lamports: u64,
    space: u64,
) -> ProgramResult {
    // This is a stub - in production you'd invoke the System Program's CreateAccount instruction
    // For now, we'll just return success since the account creation logic is complex
    Ok(())
}

/// Create account via CPI to System Program
fn create_account_via_cpi(
    program_id: &Pubkey,
    payer: &AccountInfo,
    new_account: &AccountInfo,
    system_program: &AccountInfo,
    seeds: &[&[u8]],
    bump: u8,
    space: u64,
) -> ProgramResult {
    // Calculate rent exemption (simplified - in production use actual rent calculation)
    let lamports = 890880u64; // Minimum for small accounts
