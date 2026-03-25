//! Tests for LitterBox v2 Pinocchio program

#[cfg(test)]
mod tests {
    use crate::*;

    #[test]
    fn test_config_size() {
        // Verify Config struct size
        assert_eq!(Config::LEN, 86);
    }

    #[test]
    fn test_virtual_pool_size() {
        // Verify VirtualPool struct size
        assert_eq!(VirtualPool::LEN, 41);
    }

    #[test]
    fn test_initialize_params_size() {
        // Verify InitializeParams is 24 bytes (3 x u64)
        assert_eq!(std::mem::size_of::<InitializeParams>(), 24);
    }

    #[test]
    fn test_error_codes() {
        // Verify error codes convert correctly
        let error: ProgramError = LitterError::InvalidAmount.into();
        assert!(matches!(error, ProgramError::Custom(code) if code == 0));

        let error: ProgramError = LitterError::SlippageExceeded.into();
        assert!(matches!(error, ProgramError::Custom(code) if code == 1));
    }

    #[test]
    fn test_constants() {
        // Verify constants
        assert_eq!(MIN_DEPOSIT_USDC, 1_000_000);
        assert_eq!(MIN_SWEEP_USDC, 100_000);
        assert_eq!(PLATFORM_FEE_BPS, 200);
        assert_eq!(MODE_VIRTUAL, 0);
        assert_eq!(MODE_REAL, 1);
    }

    #[test]
    fn test_bonding_curve_calculation() {
        // Test bonding curve: litter_out = (virtual_litter * usdc_in) / (virtual_usdc + usdc_in)
        let virtual_usdc: u128 = 100_000_000; // 100 USDC
        let virtual_litter: u128 = 1_000_000_000_000; // 1M LITTER
        let usdc_in: u128 = 10_000_000; // 10 USDC

        let litter_out = (virtual_litter * usdc_in) / (virtual_usdc + usdc_in);

        // Should receive approximately 90,909,090 LITTER tokens
        assert_eq!(litter_out, 90909090909);
    }

    #[test]
    fn test_fee_calculation() {
        // Test 2% fee
        let amount = 10_000_000; // 10 USDC
        let fee = amount.wrapping_mul(2).wrapping_div(100);
        let after_fee = amount.wrapping_sub(fee);

        assert_eq!(fee, 200_000); // 0.2 USDC fee
        assert_eq!(after_fee, 9_800_000); // 9.8 USDC after fee
    }

    #[test]
    fn test_graduation_threshold() {
        // Test graduation threshold check
        let threshold: u64 = 1000 * 1_000_000; // 1000 USDC
        let accumulated: u64 = 1050 * 1_000_000; // 1050 USDC

        assert!(accumulated >= threshold);
    }

    #[test]
    fn test_pda_seeds() {
        // Verify seed strings
        assert_eq!(CONFIG_SEED, b"config");
        assert_eq!(VIRTUAL_POOL_SEED, b"virtual_pool");
        assert_eq!(USDC_VAULT_SEED, b"usdc_vault");
        assert_eq!(LITTER_VAULT_SEED, b"litter_vault");
    }
}
