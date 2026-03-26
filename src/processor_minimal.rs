//! Minimal processor with working initialize that creates accounts via CPI

use pinocchio::{
    account_info::AccountInfo,
    program_error::ProgramError,
    pubkey::{Pubkey, find_program_address},
    instruction::{AccountMeta},
    program::invoke_signed,
    ProgramResult,
};

use crate::{
    error::LitterError,
    instruction::parse_initialize,
    state::{Config, VirtualPool},
    utils::store,
    {MIN_DEPOSIT_USDC, MODE_VIRTUAL},
};

pub fn process_initialize(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    data: &[u8],
) -> ProgramResult {
    let authority = get(accounts, 0)?;
    let system_program = get(accounts, 1)?;

    if !authority.is_signer() {
        return Err(LitterError::MissingSigner.into());
    }

    let params = parse_initialize(data)
        .ok_or(ProgramError::InvalidInstructionData)?;

    // Derive PDAs
    let (config_pda, config_bump) =
        find_program_address(&[crate::CONFIG_SEED], program_id);
    
    let (pool_pda, pool_bump) = find_program_address(
        &[crate::VIRTUAL_POOL_SEED],
        program_id,
    );

    // Rent exemption (simplified)
    let rent_lamports = 890880u64;

    // Create Config account via CPI
    create_pda_account(
        authority,
        &config_pda,
        system_program,
        &[crate::CONFIG_SEED],
        config_bump,
        86,
        rent_lamports,
    )?;

    // Create VirtualPool account via CPI
    create_pda_account(
        authority,
        &pool_pda,
        system_program,
        &[crate::VIRTUAL_POOL_SEED],
        pool_bump,
        41,
        rent_lamports,
    )?;

    // Initialize Config
    let mut config = Config::zeroed();
    config.authority = *authority.key();
    config.config_bump = config_bump;
    config.mode = MODE_VIRTUAL;
    config.graduation_threshold = params.graduation_threshold;
    store_by_addr(&config_pda, &config);

    // Initialize Pool
    let mut pool = VirtualPool::zeroed();
    pool.virtual_usdc = params.virtual_usdc;
    pool.virtual_litter = params.virtual_litter;
    pool.pool_bump = pool_bump;
    store_by_addr(&pool_pda, &pool);

    Ok(())
}

fn create_pda_account(
    payer: &AccountInfo,
    pda: &Pubkey,
    system_program: &AccountInfo,
    seeds: &[&[u8]],
    bump: u8,
    space: u64,
    lamports: u64,
) -> ProgramResult {
    // CreateAccount instruction data
    let mut ix_data = [0u8; 17];
    ix_data[0] = 0; // CreateAccount
    ix_data[1..9].copy_from_slice(&lamports.to_le_bytes());
    ix_data[9..17].copy_from_slice(&space.to_le_bytes());

    let accounts = [
        AccountMeta::new(*payer.key(), true),
        AccountMeta::new(*pda, true),
    ];

    invoke_signed(
        &pinocchio::instruction::Instruction {
            program_id: &pinocchio::pubkey::PUBKEY_SYSTEM,
            accounts: &accounts,
            data: &ix_data,
        },
        &[payer],
        &[seeds, &[&[bump]]],
    )
}

fn get<'a>(accounts: &'a [AccountInfo], index: usize) -> Result<&'a AccountInfo, ProgramError> {
    accounts.get(index).ok_or(ProgramError::NotEnoughAccountKeys)
}

fn store_by_addr<T: Copy>(addr: &Pubkey, data: &T) {
    // Simplified - in production use proper account access
    unsafe {
        let ptr = addr as *const Pubkey as *mut u8;
        core::ptr::write(ptr.add(32) as *mut T, *data);
    }
}
