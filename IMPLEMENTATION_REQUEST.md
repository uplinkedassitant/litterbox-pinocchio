# 🚨 Implementation Request: Real Token Custody for LitterBox

## 📋 Project Overview

**Project:** LitterBox v2 - Meme Token Recycler on Solana  
**Goal:** Enable real SPL token custody (USDC deposits, Litter token minting)  
**Current State:** Virtual tracking only (no actual token transfers)  
**Needed:** Implement real token transfers using pinocchio-token

---

## 🔧 Environment & Versions

```
Rust: 1.75+ (Solana toolchain)
Pinocchio: =0.9.3
Pinocchio-Token: =0.2.0 (just added)
Solana: Devnet
Program ID: B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr
Litter Mint: FXyF4rttJ15yP9tBMdW24GchihjsnqZ1aqMsQvGPqbSR
USDC Mint (Devnet): 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
```

**Repository:** https://github.com/uplinkedassitant/litterbox-pinocchio  
**Frontend:** https://github.com/uplinkedassitant/litterbox-v2-frontend

---

## 🎯 What Needs to Be Done

### File 1: `src/processor.rs`

**Current State:**
- `process_deposit()` accepts 3 accounts (user, config, pool)
- Only updates virtual balances
- No actual token transfers

**Required Change:**
Update `process_deposit()` to:
1. Accept 7 accounts (add user_usdc, pool_usdc, litter_vault, user_litter)
2. Transfer USDC from user → pool vault using `pinocchio_token::transfer()`
3. Mint Litter tokens to user using `pinocchio_token::mint_to()`

**Exact Code Needed:**

```rust
fn process_deposit(
  program_id: &Pubkey,
  accounts: &[AccountInfo],
  data: &[u8],
) -> ProgramResult {
  // Accept 7 accounts
  let user = get(accounts, 0)?;
  let config_acc = get(accounts, 1)?;
  let pool_acc = get(accounts, 2)?;
  let user_usdc = get(accounts, 3)?;      // User's USDC ATA
  let pool_usdc = get(accounts, 4)?;      // Pool's USDC vault
  let litter_vault = get(accounts, 5)?;   // Pool's Litter vault
  let user_litter = get(accounts, 6)?;    // User's Litter ATA

  // Validation
  if !user.is_signer() {
    return Err(LitterError::MissingSigner.into());
  }

  if !pool_acc.is_writable() || !user_usdc.is_writable() || !pool_usdc.is_writable() {
    return Err(ProgramError::InvalidArgument);
  }

  // Parse instruction data
  let params = parse_deposit(data).ok_or(ProgramError::InvalidInstructionData)?;
  if params.usdc_amount < MIN_DEPOSIT_USDC {
    return Err(LitterError::InvalidAmount.into());
  }

  // Load and validate config
  let config: Config = load(config_acc)?;
  if config.mode != MODE_VIRTUAL {
    return Err(LitterError::InvalidMode.into());
  }

  // Load pool state
  let mut pool: VirtualPool = load(pool_acc)?;
  let (_, net_usdc) = split_fee(params.usdc_amount)?;
  let litter_out = calc_litter_out(pool.virtual_usdc, pool.virtual_litter, net_usdc)?;

  // Slippage check
  if litter_out < params.min_litter_out {
    return Err(LitterError::SlippageExceeded.into());
  }

  // Update virtual pool state
  pool.virtual_usdc = pool.virtual_usdc.checked_add(net_usdc).ok_or(LitterError::Overflow)?;
  pool.virtual_litter = pool.virtual_litter.checked_sub(litter_out).ok_or(LitterError::Overflow)?;
  pool.real_usdc = pool.real_usdc.checked_add(net_usdc).ok_or(LitterError::Overflow)?;
  store(pool_acc, &pool)?;

  // ✅ TRANSFER USDC: user → pool vault
  pinocchio_token::transfer(
    user_usdc,      // from: user's USDC ATA
    pool_usdc,      // to: pool's USDC vault
    user,           // authority: user (signer)
    net_usdc,       // amount in smallest units (e.g., 1000000 for 1 USDC)
  )?;

  // ✅ MINT LITTER: vault → user
  pinocchio_token::mint_to(
    litter_vault,   // mint authority (program-controlled)
    user_litter,    // destination: user's Litter ATA
    litter_out,     // amount to mint
    program_id,     // program ID for signing
  )?;

  Ok(())
}
```

### File 2: `src/lib.rs` (if exists) or `Cargo.toml`

**Already Done:** ✅ `pinocchio-token = "=0.2.0"` added to dependencies

---

## 🧪 Testing Requirements

After implementation, the flow should work:

1. **User has:** 100 USDC in wallet
2. **User calls:** `deposit(100 USDC)`
3. **Program should:**
   - Transfer 100 USDC from user → pool vault
   - Mint Litter tokens based on bonding curve
   - Send Litter to user's wallet
4. **Result:**
   - User USDC balance: -100
   - User Litter balance: +X (based on curve)
   - Pool USDC balance: +100
   - Pool Litter minted: +X

---

## 📁 File Locations

```
/home/jay/.openclaw/workspace/litterbox-pinocchio-fixed-2/
├── Cargo.toml              ✅ Already updated
├── src/
│   ├── processor.rs        🔧 NEEDS EDIT (main task)
│   ├── lib.rs              (check if exports needed)
│   ├── constants.rs        (already has program IDs)
│   ├── instruction.rs      (already has structs)
│   └── utils.rs            (already has bonding curve math)
└── TOKEN_INTEGRATION_GUIDE.md  (reference doc)
```

---

## 🎯 Success Criteria

- [ ] Program compiles with `cargo build-sbf`
- [ ] Program deploys to Solana Devnet
- [ ] Frontend can deposit USDC (real transfer, not virtual)
- [ ] User's USDC balance decreases
- [ ] Pool's USDC balance increases
- [ ] User receives Litter tokens
- [ ] Transaction appears on Solana explorer

---

## 🚀 Current Frontend Status

The frontend is **READY** and waiting:
- ✅ Accepts any SPL token (USDC, BONK, WIF, POPCAT)
- ✅ Converts to USDC value using hardcoded prices
- ✅ Creates deposit instruction with proper accounts
- ⏳ Just needs backend to execute real transfers!

Frontend will automatically work once backend is updated.

---

## 📞 Contact

**Developer:** Jay @ Uplinked LLC  
**Email:** jay@uplinkedmd.com  
**Telegram:** Available in workspace  
**Priority:** HIGH - This is the final piece for full functionality!

---

## 💡 Notes

- The bonding curve math is already implemented and working
- Virtual tracking works perfectly (just accounting, no custody)
- This change adds **real token custody** (actual transfers)
- Frontend already handles all token types via virtual conversion
- Once this is done, the system is production-ready!

---

**Last Updated:** 2026-03-26 17:16 EDT  
**Status:** Ready for implementation - dependencies installed, guide written, frontend ready!
