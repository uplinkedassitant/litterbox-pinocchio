//! LitterBox v2 - Minimal working Pinocchio program

#![no_std]

use pinocchio::{
    account_info::AccountInfo,
    default_allocator,
    default_panic_handler,
    program_entrypoint,
    pubkey::Pubkey,
    ProgramResult,
};

// Program ID: 8LhTE9owPwbdJMHbE7Nwi9i2H66JsPHzjwWbKPgLUa7t

program_entrypoint!(process_instruction);
default_allocator!();
default_panic_handler!();

pub fn process_instruction(
    _program_id: &Pubkey,
    _accounts: &[AccountInfo],
    _instruction_data: &[u8],
) -> ProgramResult {
    Ok(())
}
