//! On-chain account layouts.
//!
//! Both structs are `#[repr(C, packed)]` + bytemuck `Pod + Zeroable` so we
//! can cast raw `&[u8]` slices directly without any copies.
//!
//! `#[repr(C, packed)]` eliminates hidden alignment padding so the sizes are
//! exactly what we assert at the bottom of this file.  Never take a reference
//! to an individual field of a packed struct directly — always copy first.

use bytemuck::{Pod, Zeroable};

// ─────────────────────────────────────────────────────────────────────────────
// Config  (86 bytes)
// ─────────────────────────────────────────────────────────────────────────────
//
// Offset  Size  Field
// ──────  ────  ─────────────────────────────────────────────────
//      0    32  authority           — who can sweep / graduate
//     32    32  litter_mint         — SPL mint for LITTER token
//     64     1  config_bump         — PDA bump for this account
//     65     1  mode                — 0 = virtual, 1 = real AMM
//     66     8  graduation_threshold— real USDC needed to graduate
//     74     8  total_fees_collected— running fee total
//     82     4  _pad                — reserved / future use
// ──────  ────
//     86       TOTAL
//
#[repr(C, packed)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct Config {
    pub authority:             [u8; 32],
    pub litter_mint:           [u8; 32],
    pub config_bump:           u8,
    pub mode:                  u8,
    pub graduation_threshold:  u64,
    pub total_fees_collected:  u64,
    pub _pad:                  [u8; 4],
}

impl Config {
    pub const LEN: usize = core::mem::size_of::<Config>();
}

// ─────────────────────────────────────────────────────────────────────────────
// VirtualPool  (41 bytes)
// ─────────────────────────────────────────────────────────────────────────────
//
// Offset  Size  Field
// ──────  ────  ──────────────────────────────────────────────
//      0     8  virtual_usdc      — virtual reserve USDC
//      8     8  virtual_litter    — virtual reserve LITTER
//     16     8  real_usdc         — real deposited USDC
//     24     1  pool_bump         — PDA bump for this account
//     25     1  usdc_vault_bump   — PDA bump for USDC vault
//     26     1  litter_vault_bump — PDA bump for LITTER vault
//     27    14  _pad              — reserved
// ──────  ────
//     41       TOTAL
//
#[repr(C, packed)]
#[derive(Clone, Copy, Debug, Pod, Zeroable)]
pub struct VirtualPool {
    pub virtual_usdc:        u64,
    pub virtual_litter:      u64,
    pub real_usdc:           u64,
    pub pool_bump:           u8,
    pub usdc_vault_bump:     u8,
    pub litter_vault_bump:   u8,
    pub _pad:                [u8; 14],
}

impl VirtualPool {
    pub const LEN: usize = core::mem::size_of::<VirtualPool>();
}

// ── compile-time size guards ─────────────────────────────────────────────────
const _: () = {
    assert!(Config::LEN     == 86, "Config must be 86 bytes");
    assert!(VirtualPool::LEN == 41, "VirtualPool must be 41 bytes");
};
