# Complete Testing Guide - LitterBox v2

This guide covers all testing options from simplest to most advanced.

## Option 1: Quick Local Test (Easiest)

**Best for:** First-time testing, quick iteration

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Start test validator in background
solana-test-validator &

# Wait 5 seconds, then deploy
sleep 5
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost

# Get your wallet address
solana address

# Airdrop SOL
solana airdrop 100 --url localhost

# Check balance
solana balance --url localhost
```

**Pros:** Simple, fast, no dependencies
**Cons:** Basic features only

---

## Option 2: Surfpool (Recommended)

**Best for:** Realistic testing with plugins

### Install Surfpool

```bash
# Via npm
npm install -g surfpool

# Or via cargo
cargo install surfpool
```

### Start Surfpool

```bash
# Start with token plugin
surfpool run --rpc-port 8899 --plugins token,memo
```

### Deploy & Test

```bash
# In a new terminal
solana config set --url localhost

# Deploy program
solana program deploy target/deploy/litterbox_pinocchio.so

# Airdrop (Surfpool gives unlimited)
solana airdrop 100

# Check deployment
solana program show <PROGRAM_ID>
```

**Pros:** Token support, realistic simulation, plugins
**Cons:** Slightly more setup

---

## Option 3: Automated Script

**Best for:** Repeated testing, CI/CD

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Run the setup script
./scripts/test-local.sh
```

This script will:
1. Build the program if needed
2. Start validator (Surfpool or basic)
3. Create wallet if missing
4. Airdrop SOL
5. Deploy program
6. Show program ID

**Pros:** Fully automated, reproducible
**Cons:** Requires script setup

---

## Option 4: Docker (Most Isolated)

**Best for:** CI/CD, consistent environments

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Build program first
cargo build-sbf --sbf-out-dir ./target/deploy

# Start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop when done
docker-compose down
```

**Pros:** Isolated, reproducible, clean
**Cons:** Docker overhead, slower iteration

---

## Testing Each Instruction

### 1. Initialize Test

Create `test-init.sh`:

```bash
#!/bin/bash
# Test initialize instruction

PROGRAM_ID="<YOUR_PROGRAM_ID>"
SOLANA_URL="http://localhost:8899"

# Derive PDAs (you'll need a script for this)
# Or use solana-keygen to derive

echo "Testing initialize..."
# Send initialize instruction via client script
node test-init.js

echo "✅ Initialize test complete"
```

### 2. Deposit Test

```bash
# After initialization
echo "Testing deposit..."
node test-deposit.js

# Expected: Should receive LITTER tokens based on bonding curve
```

### 3. Sweep Test

```bash
echo "Testing sweep..."
node test-sweep.js

# Expected: Should accumulate USDC in virtual pool
```

### 4. Graduate Test

```bash
echo "Testing graduation..."
node test-graduate.js

# Expected: Should transition to real mode if threshold met
```

---

## Unit Tests (Rust)

Run built-in unit tests:

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Run all tests
cargo test

# Run specific test
cargo test test_config_size

# Run with output
cargo test -- --nocapture
```

Expected output:
```
running 9 tests
test tests::test_config_size ... ok
test tests::test_virtual_pool_size ... ok
test tests::test_bonding_curve_calculation ... ok
test tests::test_error_codes ... ok
test tests::test_constants ... ok
test tests::test_fee_calculation ... ok
test tests::test_graduation_threshold ... ok
test tests::test_pda_seeds ... ok

test result: ok. 9 passed; 0 failed
```

---

## Integration Test Template

Create `tests/integration.ts`:

```typescript
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { loadProgram } from './utils';

describe('LitterBox v2 Integration Tests', () => {
  let connection: Connection;
  let program: any;
  let payer: Keypair;
  let configPda: PublicKey;
  let virtualPoolPda: PublicKey;

  beforeAll(async () => {
    // Setup
    connection = new Connection('http://localhost:8899');
    payer = await loadKeypair();
    program = await loadProgram();
    
    // Derive PDAs
    [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('config')],
      program.programId
    );
    
    [virtualPoolPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('virtual_pool')],
      program.programId
    );
  });

  test('Initialize program', async () => {
    const tx = await program.methods
      .initialize({
        graduationThreshold: new BN(1000 * 1e6),
        virtualInitialUsdc: new BN(100 * 1e6),
        virtualInitialLitter: new BN(1_000_000 * 1e6),
      })
      .accounts({ config: configPda, virtualPool: virtualPoolPda })
      .rpc();
    
    await connection.confirmTransaction(tx);
    // Verify initialization
  });

  test('Deposit tokens', async () => {
    // Test deposit instruction
  });

  test('Sweep USDC', async () => {
    // Test sweep instruction
  });
});
```

Run with:
```bash
npm test
```

---

## Debugging Tips

### 1. Check Program Logs

```bash
# Stream logs in real-time
solana logs --url localhost

# Filter by program
solana logs <PROGRAM_ID> --url localhost
```

### 2. Inspect Accounts

```bash
# Check config account
solana account <CONFIG_PDA> --url localhost

# Check virtual pool account
solana account <VIRTUAL_POOL_PDA> --url localhost
```

### 3. Verify PDAs

```bash
# Derive and verify PDA
solana-keygen pubkey-presenter
# Or use a script to derive
```

### 4. Check Transaction Status

```bash
# View transaction details
solana transaction <SIGNATURE> --url localhost
```

---

## Common Test Scenarios

### Scenario 1: Test Full Flow

```bash
# 1. Start validator
solana-test-validator &
sleep 5

# 2. Deploy
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost

# 3. Initialize
node scripts/init.js

# 4. Deposit multiple times
node scripts/deposit.js  # Run 5-10 times

# 5. Check accumulation
solana account <CONFIG_PDA> --url localhost

# 6. Test graduation (if threshold met)
node scripts/graduate.js
```

### Scenario 2: Test Error Cases

```typescript
// Test insufficient deposit
try {
  await deposit(500_000); // Less than MIN_DEPOSIT_USDC
} catch (e) {
  expect(e.message).toContain('DepositTooSmall');
}

// Test invalid slippage
try {
  await deposit(10_000_000, 999_999_999_999); // Unrealistic min output
} catch (e) {
  expect(e.message).toContain('SlippageExceeded');
}
```

### Scenario 3: Load Testing

```typescript
// Test multiple concurrent deposits
const deposits = Array(10).fill(0).map(async () => {
  return deposit(10_000_000);
});

await Promise.all(deposits);
```

---

## Performance Testing

```bash
# Measure transaction time
time node scripts/deposit.js

# Check compute units used
solana transaction <SIGNATURE> --url localhost

# Monitor validator performance
solana transaction-count --url localhost
```

---

## Test Checklist

Before moving to devnet:

- [ ] All unit tests pass
- [ ] Initialize works
- [ ] Deposit calculates correctly
- [ ] Fee calculation is accurate (2%)
- [ ] Slippage protection works
- [ ] Sweep accumulates properly
- [ ] Graduation threshold check works
- [ ] Mode transition works
- [ ] Error cases handled correctly
- [ ] PDA derivation consistent
- [ ] Account data validated properly

---

## Next Steps After Testing

1. ✅ Local testing complete
2. Deploy to devnet
3. Test with real tokens on devnet
4. Security audit
5. Mainnet deployment

---

**Ready to test?** Start with Option 1 for quick validation, then move to Surfpool for comprehensive testing! 🧪
