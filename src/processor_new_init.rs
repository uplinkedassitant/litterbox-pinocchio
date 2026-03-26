// New initialize function with correct PDA creation via CPI
// This replaces the old process_initialize function

fn process_initialize(
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

    // Derive Config PDA
    let (config_pda, config_bump) =
        find_program_address(&[crate::CONFIG_SEED], program_id);
    
    // Derive VirtualPool PDA
    let (pool_pda, pool_bump) = find_program_address(
        &[crate::VIRTUAL_POOL_SEED],
        program_id,
    );

    // Account sizes
    let config_space = 86u64;
    let pool_space = 41u64;
    
    // Calculate rent (simplified)
    let rent_lamports = 890880u64;

    // Create Config account via CPI using the correct pattern from the resource
    let config_bump_ref = &[config_bump];
    let config_seeds = seeds!(crate::CONFIG_SEED, config_bump_ref);
    let config_signer = Signer::from(&config_seeds);
    
    CreateAccount {
        from: authority,
        to: &config_pda,
        lamports: rent_lamports,
        space: config_space,
        owner: program_id,
    }.invoke_signed(&[config_signer])?;

    // Create VirtualPool account via CPI
    let pool_bump_ref = &[pool_bump];
    let pool_seeds = seeds!(crate::VIRTUAL_POOL_SEED, pool_bump_ref);
    let pool_signer = Signer::from(&pool_seeds);
    
    CreateAccount {
        from: authority,
        to: &pool_pda,
        lamports: rent_lamports,
        space: pool_space,
        owner: program_id,
    }.invoke_signed(&[pool_signer])?;

    // Initialize Config data
    let mut config = Config::zeroed();
    config.authority = *authority.key();
    config.config_bump = config_bump;
    config.mode = MODE_VIRTUAL;
    config.graduation_threshold = params.graduation_threshold;
    store_by_addr(&config_pda, &config);

    // Initialize Pool data
    let mut pool = VirtualPool::zeroed();
    pool.virtual_usdc = params.virtual_usdc;
    pool.virtual_litter = params.virtual_litter;
    pool.pool_bump = pool_bump;
    store_by_addr(&pool_pda, &pool);

    Ok(())
}

// Helper to store data at PDA address
fn store_by_addr<T: Copy>(addr: &Pubkey, data: &T) {
    unsafe {
        let ptr = addr as *const Pubkey as *mut u8;
        core::ptr::write(ptr.add(32) as *mut T, *data);
    }
}
