//! Program-specific errors.

use pinocchio::program_error::ProgramError;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
#[repr(u32)]
pub enum LitterError {
    /// Amount is zero or below the minimum.
    InvalidAmount       = 0,
    /// Slippage tolerance exceeded.
    SlippageExceeded    = 1,
    /// Pool is not in the expected mode (virtual vs real).
    InvalidMode         = 2,
    /// The provided authority does not match the stored one.
    InvalidAuthority    = 3,
    /// Arithmetic overflow.
    Overflow            = 4,
    /// Pool has not yet met the graduation threshold.
    NotGraduated        = 5,
    /// Pool has already graduated.
    AlreadyGraduated    = 6,
    /// An account's owner does not match expectations.
    InvalidOwner        = 7,
    /// A required signer is missing.
    MissingSigner       = 8,
    /// Account discriminator / magic bytes are wrong.
    InvalidAccountData  = 9,
}

impl From<LitterError> for ProgramError {
    fn from(e: LitterError) -> Self {
        ProgramError::Custom(e as u32)
    }
}
