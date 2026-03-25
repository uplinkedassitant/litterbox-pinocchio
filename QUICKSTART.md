# Quick Start Guide

## Build the Program

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Build for on-chain deployment
cargo build-sbf --sbf-out-dir ./target/deploy
```

Expected output:
```
Finished release [optimized] target(s) in XX.Xs
```

## Run Tests

```bash
# Unit tests
cargo test

# Should see:
# test tests::test_config_size ... ok
# test tests::test_virtual_pool_size ... ok
# test tests::test_bonding_curve_calculation ... ok
# ...
# test result: ok. 9 passed; 0 failed
```

## Deploy to Local Validator

```bash
# Terminal 1: Start validator
solana-test-validator

# Terminal 2: Deploy
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost

# Note the program ID
```

## What's Next?

1. **Read DEPLOYMENT.md** for detailed deployment steps
2. **Check PROJECT_SUMMARY.md** for complete overview
3. **Review client-example.ts** for integration code
4. **Test locally** before deploying to devnet

## Common First Steps

```bash
# Check if build succeeded
ls -la target/deploy/

# Should see:
# - litterbox_pinocchio.so
# - litterbox_pinocchio.dwp
```

## Need Help?

- **Build errors**: Check Rust/Solana toolchain installation
- **Test failures**: Review error messages in tests.rs
- **Deployment issues**: See DEPLOYMENT.md troubleshooting section

---

Ready to build? Run `cargo build-sbf` in the project directory! 🚀
