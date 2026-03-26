//! Instruction discriminators and parameter structs.
//!
//! Instruction data layout:
//!   byte 0       — discriminator (see `disc` constants)
//!   bytes 1..N   — instruction-specific payload (see struct below)
//!
//! ALIGNMENT NOTE: The payload bytes start at offset 1 of the runtime's
//! instruction_data buffer.  Even if the buffer itself is 8-byte aligned, the
//! payload slice `&data[1..]` starts at +1 and is therefore NOT guaranteed to
//! be 8-byte aligned.  All parse helpers use `bytemuck::try_pod_read_unaligned`
//! (a safe memcpy-based read) rather than `try_from_bytes` (which requires the
//! slice to be aligned to the type's alignment and would return Err otherwise).

use bytemuck::{Pod, Zeroable};

/// Discriminator byte — instruction_data[0].
pub mod disc {
    pub const INITIALIZE: u8 = 0;
    pub const DEPOSIT:    u8 = 1;
    pub const SWEEP:      u8 = 2;
    pub const GRADUATE:   u8 = 3;
    pub const FLUSH:      u8 = 4;
}

// ── parameter structs ─────────────────────────────────────────────────────────

/// `initialize` payload — 24 bytes (3 × u64).
#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct InitializeParams {
    pub virtual_usdc:         u64,
    pub virtual_litter:       u64,
    pub graduation_threshold: u64,
}

/// `deposit` payload — 16 bytes (2 × u64).
#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct DepositParams {
    pub usdc_amount:   u64,
    pub min_litter_out: u64,
}

/// `sweep` / `flush` payload — 8 bytes (1 × u64).
#[repr(C)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct AmountParam {
    pub amount: u64,
}

// ── unaligned-safe parse helpers ──────────────────────────────────────────────
//
// `bytemuck::try_pod_read_unaligned` does a safe memcpy into a properly-
// aligned stack value, so it works correctly even when `data` starts at an
// odd byte offset (which is always the case here: `data` is `instruction_data[1..]`).

pub fn parse_initialize(data: &[u8]) -> Option<InitializeParams> {
    let size = core::mem::size_of::<InitializeParams>();
    if data.len() < size { return None; }
    bytemuck::try_pod_read_unaligned::<InitializeParams>(&data[..size]).ok()
}

pub fn parse_deposit(data: &[u8]) -> Option<DepositParams> {
    let size = core::mem::size_of::<DepositParams>();
    if data.len() < size { return None; }
    bytemuck::try_pod_read_unaligned::<DepositParams>(&data[..size]).ok()
}

pub fn parse_amount(data: &[u8]) -> Option<AmountParam> {
    let size = core::mem::size_of::<AmountParam>();
    if data.len() < size { return None; }
    bytemuck::try_pod_read_unaligned::<AmountParam>(&data[..size]).ok()
}
