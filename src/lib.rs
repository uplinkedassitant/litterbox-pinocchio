//! LitterBox v2 — Pinocchio 0.9.3 on-chain program
//!
//! Build (SBF binary):
//!   cargo build-sbf --features bpf-entrypoint --sbf-out-dir ./target/deploy
//!
//! Test (host):
//!   cargo test
//!
//! The `bpf-entrypoint` feature gates all three global symbols
//! (entrypoint fn, #[global_allocator], #[panic_handler]) so the crate
//! can be depended on as a plain library without duplicate-symbol errors.

#![no_std]

// ── public re-exports ────────────────────────────────────────────────────────
pub use error::LitterError;
pub use state::{Config, VirtualPool};
pub use instruction::InitializeParams;

// ── constants ────────────────────────────────────────────────────────────────
pub const MIN_DEPOSIT_USDC:  u64 = 1_000_000;  // 1 USDC (6 decimals)
pub const MIN_SWEEP_USDC:    u64 = 100_000;     // 0.1 USDC
pub const PLATFORM_FEE_BPS:  u64 = 200;         // 2%
pub const MODE_VIRTUAL:      u8  = 0;
pub const MODE_REAL:         u8  = 1;

// PDA seeds
pub const CONFIG_SEED:       &[u8] = b"config";
pub const VIRTUAL_POOL_SEED: &[u8] = b"virtual_pool";
pub const USDC_VAULT_SEED:   &[u8] = b"usdc_vault";
pub const LITTER_VAULT_SEED: &[u8] = b"litter_vault";

// ── modules ──────────────────────────────────────────────────────────────────
mod error;
mod instruction;
mod processor;
mod state;
mod utils;

// ── SBF-only entrypoint ───────────────────────────────────────────────────────
//
// ALL THREE symbols must be defined together and only once.
//
// IMPORTANT: Because this crate is `#[no_std]`, we must use:
//   - program_entrypoint!  (declares the `entrypoint` extern "C" fn)
//   - default_allocator!   (declares the #[global_allocator])
//   - nostd_panic_handler! (declares the #[panic_handler])
//
// We CANNOT use `default_panic_handler!` alone — that macro only registers
// a `custom_panic` hook used by the std runtime.  Without nostd_panic_handler!
// the #[panic_handler] attribute is never defined and the SBF link fails.
// We CANNOT use the high-level `entrypoint!` macro because it calls
// `default_panic_handler!` (the hook variant), not `nostd_panic_handler!`.
#[cfg(feature = "bpf-entrypoint")]
mod entrypoint {
    use pinocchio::{
        default_allocator,
        nostd_panic_handler,
        program_entrypoint,
    };
    use crate::processor::process_instruction;

    program_entrypoint!(process_instruction);
    default_allocator!();
    nostd_panic_handler!();
}

// ── unit tests ────────────────────────────────────────────────────────────────
#[cfg(test)]
mod tests;
