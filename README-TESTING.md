# 🏄‍♂️ Local Testing Setup - Quick Reference

## TL;DR - Fastest Path

```bash
# 1. Build
cargo build-sbf --sbf-out-dir ./target/deploy

# 2. Start local validator
solana-test-validator &

# 3. Wait for it to start
sleep 5

# 4. Deploy
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost

# 5. Get SOL
solana airdrop 100 --url localhost

# 6. Test!
```

---

## Testing Options Compared

| Method | Best For | Setup Time | Realism |
|--------|----------|------------|---------|
| **solana-test-validator** | Quick iteration | 2 min | Basic |
| **Surfpool** | Full testing | 5 min | High |
| **Docker** | CI/CD | 10 min | High |
| **Automated script** | Reproducibility | 5 min | Medium |

---

## Surfpool Setup (Recommended)

### Install
```bash
npm install -g surfpool
```

### Run
```bash
# Start Surfpool with plugins
surfpool run --rpc-port 8899 --plugins token,memo

# In another terminal, deploy your program
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost
```

### Benefits
- ✅ Realistic cluster simulation
- ✅ Token program support
- ✅ Unlimited airdrops
- ✅ Plugin ecosystem
- ✅ Better error messages

---

## Files You Need

All files are in `/home/jay/.openclaw/workspace/litterbox-pinocchio/`:

```
litterbox-pinocchio/
├── src/lib.rs                    # Main program ✅
├── Cargo.toml                    # Dependencies ✅
├── scripts/
│   └── test-local.sh             # Automated test script ✅
├── docker-compose.yml            # Docker setup ✅
├── surfpool-config.yaml          # Surfpool config ✅
├── LOCAL_TESTING.md              # Detailed local testing guide ✅
├── TESTING-GUIDE.md              # Complete testing reference ✅
├── DEPLOYMENT.md                 # Deployment guide ✅
├── PROJECT_SUMMARY.md            # Project overview ✅
└── QUICKSTART.md                 # Quick start guide ✅
```

---

## Step-by-Step: First Test

### Step 1: Build the Program
```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio
cargo build-sbf --sbf-out-dir ./target/deploy
```

Expected: `Finished release [optimized] target(s)`

### Step 2: Start Validator
```bash
# Option A: Basic validator
solana-test-validator

# Option B: Surfpool (better)
surfpool run --rpc-port 8899 --plugins token
```

### Step 3: Deploy
```bash
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost
```

Save the program ID!

### Step 4: Get SOL
```bash
solana airdrop 100 --url localhost
solana balance --url localhost
```

### Step 5: Test Instructions
Use the TypeScript client or create test scripts for each instruction.

---

## Common Commands

```bash
# Check program deployed
solana program show <PROGRAM_ID> --url localhost

# View logs
solana logs --url localhost
solana logs <PROGRAM_ID> --url localhost

# Check account
solana account <ACCOUNT_ADDRESS> --url localhost

# Get more SOL
solana airdrop 100 --url localhost

# Stop validator
pkill -f solana-test-validator
pkill -f surfpool
```

---

## Troubleshooting

### "Connection refused"
Validator not running. Start it first:
```bash
solana-test-validator
# or
surfpool run --rpc-port 8899
```

### "Program deployment failed"
Make sure you built first:
```bash
cargo build-sbf --sbf-out-dir ./target/deploy
```

### "Insufficient funds"
Airdrop more SOL:
```bash
solana airdrop 100 --url localhost
```

### "Account data too small"
PDAs need proper space. Config = 86 bytes, VirtualPool = 41 bytes.

---

## What to Test

1. ✅ **Initialize** - Create config and virtual pool
2. ✅ **Deposit** - Test bonding curve calculation
3. ✅ **Fee calculation** - Verify 2% fee
4. ✅ **Slippage protection** - Reject bad trades
5. ✅ **Sweep** - Accumulate USDC
6. ✅ **Graduation** - Transition to real mode
7. ✅ **Error handling** - All error codes work

---

## Next Steps

After local testing works:

1. Deploy to devnet
2. Test with real tokens
3. Run comprehensive tests
4. Security audit
5. Mainnet deployment

---

## Need Help?

- **LOCAL_TESTING.md** - Detailed local setup
- **TESTING-GUIDE.md** - Complete testing reference  
- **DEPLOYMENT.md** - Deployment instructions
- **PROJECT_SUMMARY.md** - Full project overview

---

**Ready?** Run `cargo build-sbf` and start testing! 🚀
