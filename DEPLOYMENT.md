# LitterBox v2 - Deployment Guide

This guide walks you through building and deploying the Pinocchio version of LitterBox v2.

## Prerequisites

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana toolchain
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Install Solana SBF toolchain
solana-install init stable

# Verify installation
rustc --version
solana --version
cargo --version
```

## Step 1: Build the Program

```bash
cd litterbox-pinocchio

# Build for on-chain deployment
cargo build-sbf --sbf-out-dir ./target/deploy
```

You should see:
```
Finished release [optimized] target(s) in XX.Xs
```

The compiled program will be at: `target/deploy/litterbox_pinocchio.so`

## Step 2: Get Devnet SOL

Since you mentioned faucet issues, here are multiple options:

**Option A: Official Devnet Faucet**
```bash
solana airdrop 2 --url devnet
```

**Option B: Alternative Faucets**
- https://solfaucet.com/
- https://faucet.solana.com/
- https://drip.helius.xyz/

**Option C: Test Locally**
```bash
# Start local validator
solana-test-validator

# Airdrop unlimited SOL locally
solana airdrop 100 --url http://localhost:8899
```

## Step 3: Deploy to Devnet

```bash
# Set cluster to devnet
solana config set --url devnet

# Deploy program
solana program deploy target/deploy/litterbox_pinocchio.so

# Note the program ID from the output
```

**Important:** Save the program ID! You'll need it for the client.

## Step 4: Update Program ID

If your deployed program ID differs from `8LhTE9owPwbdJMHbE7Nwi9i2H66JsPHzjwWbKPgLUa7t`, update:

1. `src/lib.rs` line 17: `declare_id!("YOUR_ACTUAL_PROGRAM_ID");`
2. `client-example.ts` line 15: `const PROGRAM_ID = new PublicKey('YOUR_ACTUAL_PROGRAM_ID');`

## Step 5: Initialize the Program

Create an initialization script:

```bash
# Copy the example
cp client-example.ts client.ts

# Edit with your keypair and program ID
nano client.ts
```

Run it:
```bash
npm install @solana/web3.js bs58 typescript ts-node
npx ts-node client.ts
```

## Step 6: Test the Program

```bash
# Check program deployed correctly
solana program show YOUR_PROGRAM_ID --url devnet

# View program logs
solana logs YOUR_PROGRAM_ID --url devnet
```

## Common Issues & Solutions

### Issue: "Program deployment failed"

**Solution:** Make sure you have enough SOL for deployment fees (~0.5 SOL on devnet)

### Issue: "Account data too small"

**Solution:** Your PDA accounts need proper space allocation. The Config account needs `8 + 86` bytes, VirtualPool needs `8 + 41` bytes.

### Issue: "Invalid instruction data"

**Solution:** Check that your instruction discriminator matches the program's expected format.

### Issue: "Custom program error: 0x7"

**Solution:** This is `DepositTooSmall`. Make sure your deposit amount is >= 1,000,000 (1 USDC with 6 decimals).

## Testing Locally (Recommended First Step)

Before deploying to devnet, test locally:

```bash
# Start local validator
solana-test-validator

# In another terminal, deploy
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost:8899

# Run your client against localhost
solana config set --url localhost
```

## Production Deployment Checklist

- [ ] Program builds without warnings
- [ ] All tests pass locally
- [ ] Deployed to devnet successfully
- [ ] Initialization works
- [ ] Deposit works with various amounts
- [ ] Sweep function works
- [ ] Graduation logic tested
- [ ] Program ID updated in all client code
- [ ] Backups of keypairs secured
- [ ] Upgrade authority configured (if needed)

## Upgrade Strategy

If you need to upgrade the program later:

```bash
# Deploy new version as buffer
solana program write-buffer target/deploy/litterbox_pinocchio.so

# Upgrade existing program
solana program upgrade YOUR_PROGRAM_ID target/deploy/litterbox_pinocchio.so

# Or with buffer
solana program upgrade --buffer BUFFER_ADDRESS YOUR_PROGRAM_ID
```

## Next Steps

1. Test thoroughly on devnet
2. Create comprehensive test suite
3. Audit the code before mainnet
4. Set up monitoring for program logs
5. Prepare upgrade authority management

## Support

If you run into issues:
1. Check program logs: `solana logs YOUR_PROGRAM_ID --url devnet`
2. Verify instruction format matches expected discriminator
3. Ensure PDA derivations are correct
4. Test each instruction individually before chaining

Good luck! This version should be much more stable than the Anchor version. 🚀
