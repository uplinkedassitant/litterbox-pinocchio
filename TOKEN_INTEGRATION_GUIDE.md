# Token CPI Integration Guide

## ✅ Completed: Dependencies Added

```toml
[dependencies]
pinocchio = "=0.9.3"
pinocchio-token = "=0.2.0"  # ← ADDED
bytemuck = { version = "1.14", features = ["derive"] }
```

## 📝 Required Changes to processor.rs

### Current State (Virtual Only)
```rust
fn process_deposit(...) {
  let user = get(accounts, 0)?;
  let config_acc = get(accounts, 1)?;
  let pool_acc = get(accounts, 2)?;
  
  // ... validation ...
  
  // Update virtual state
  pool.virtual_usdc += net_usdc;
  pool.virtual_litter -= litter_out;
  store(pool_acc, &pool)?;
  
  // ❌ No actual token transfer
  Ok(())
}
```

### Required State (Real Token Custody)

```rust
fn process_deposit(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  data: &[u8],
) -> ProgramResult {
  // Accept 7 accounts instead of 3
  let user = get(accounts, 0)?;
  let config_acc = get(accounts, 1)?;
  let pool_acc = get(accounts, 2)?;
  let user_usdc = get(accounts, 3)?;      // ← NEW
  let pool_usdc = get(accounts, 4)?;      // ← NEW
  let litter_vault = get(accounts, 5)?;   // ← NEW
  let user_litter = get(accounts, 6)?;    // ← NEW

  // Validation
  if !user.is_signer() {
    return Err(LitterError::MissingSigner.into());
  }

  let params = parse_deposit(data).ok_or(ProgramError::InvalidInstructionData)?;
  
  let config: Config = load(config_acc)?;
  let mut pool: VirtualPool = load(pool_acc)?;
  let (_, net_usdc) = split_fee(params.usdc_amount)?;
  let litter_out = calc_litter_out(pool.virtual_usdc, pool.virtual_litter, net_usdc)?;

  // Update virtual state
  pool.virtual_usdc = pool.virtual_usdc.checked_add(net_usdc).ok_or(LitterError::Overflow)?;
  pool.virtual_litter = pool.virtual_litter.checked_sub(litter_out).ok_or(LitterError::Overflow)?;
  pool.real_usdc = pool.real_usdc.checked_add(net_usdc).ok_or(LitterError::Overflow)?;
  store(pool_acc, &pool)?;

  // ✅ Transfer USDC from user to pool
  pinocchio_token::transfer(
    user_usdc,      // from
    pool_usdc,      // to
    user,           // authority
    net_usdc,       // amount
  )?;

  // ✅ Mint Litter tokens to user
  pinocchio_token::mint_to(
    litter_vault,   // mint authority (program)
    user_litter,    // destination
    litter_out,     // amount
    program_id,     // program ID
  )?;

  Ok(())
}
```

## 🔧 Implementation Steps

### Step 1: Edit processor.rs
Replace the `process_deposit` function with the version above that:
- Accepts 7 accounts
- Calls `pinocchio_token::transfer()`
- Calls `pinocchio_token::mint_to()`

### Step 2: Update Frontend
The frontend needs to pass all 7 accounts:
```javascript
const keys = [
  { pubkey: userPubkey, isSigner: true, isWritable: true },
  { pubkey: CONFIG_ACCOUNT, isSigner: false, isWritable: true },
  { pubkey: POOL_ACCOUNT, isSigner: false, isWritable: true },
  { pubkey: userUsdcAccount, isSigner: false, isWritable: true },      // ← NEW
  { pubkey: poolUsdcAccount, isSigner: false, isWritable: true },      // ← NEW
  { pubkey: litterVault, isSigner: false, isWritable: true },          // ← NEW
  { pubkey: userLitterAccount, isSigner: false, isWritable: true },    // ← NEW
];
```

### Step 3: Create Vault Accounts
Before deposits work, create:
1. **Pool USDC vault** - ATA owned by pool for USDC
2. **Litter vault** - ATA owned by pool for Litter tokens (pre-minted)

### Step 4: Test Flow
1. User has USDC in wallet
2. User calls deposit
3. Program transfers USDC → pool vault
4. Program mints Litter → user
5. Pool stats update

## 🎯 Testing Checklist

- [ ] Cargo compiles with pinocchio-token
- [ ] Program builds for SBF target
- [ ] Vault accounts created
- [ ] Test deposit with 1 USDC
- [ ] Verify USDC transferred to pool
- [ ] Verify Litter minted to user
- [ ] Verify pool stats updated
- [ ] Test with larger amounts
- [ ] Test error cases (insufficient balance, etc.)

## 📚 Resources

- pinocchio-token docs: https://github.com/openclaw/pinocchio-token
- Solana SPL Token: https://spl.solana.com/token
- Pinocchio examples: https://github.com/openclaw/pinocchio/tree/master/examples

---

**Status:** Ready for implementation
**Next:** Edit processor.rs with real token transfer logic
