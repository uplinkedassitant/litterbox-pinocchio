# Local Testing with Surfpool

Surfpool provides a realistic local Solana simulation with plugins for tokens, airdrops, and more.

## Installation

```bash
# Install Surfpool (requires Node.js 18+)
npm install -g surfpool

# Or use cargo if you prefer
cargo install surfpool
```

Verify installation:
```bash
surfpool --version
```

## Quick Start

### Option 1: Using Surfpool CLI

```bash
# Start Surfpool with config
cd /home/jay/.openclaw/workspace/litterbox-pinocchio
surfpool start --config surfpool-config.yaml

# This will:
# - Start local cluster on localhost:8899
# - Enable token plugin
# - Enable auto-airdrop (100 SOL when balance < 10)
# - Deploy your program (after first build)
```

### Option 2: Manual Setup (Recommended for Control)

```bash
# Terminal 1: Start Surfpool
surfpool run \
  --rpc-port 8899 \
  --ws-port 8899 \
  --airdrop-amount 100 \
  --plugins token,memo

# Terminal 2: Deploy program
solana program deploy target/deploy/litterbox_pinocchio.so \
  --url http://localhost:8899 \
  --keypair ~/.config/solana/id.json
```

## Complete Local Testing Workflow

### Step 1: Build the Program

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio
cargo build-sbf --sbf-out-dir ./target/deploy
```

### Step 2: Start Surfpool

```bash
# Start with token plugin enabled
surfpool run --rpc-port 8899 --plugins token
```

### Step 3: Get Your Wallet Ready

```bash
# Generate keypair if you don't have one
solana-keygen new --outfile ~/.config/solana/id.json

# Get wallet address
solana address --url http://localhost:8899

# Airdrop SOL (Surfpool gives unlimited airdrops)
solana airdrop 100 --url http://localhost:8899

# Check balance
solana balance --url http://localhost:8899
```

### Step 4: Deploy the Program

```bash
solana program deploy target/deploy/litterbox_pinocchio.so \
  --url http://localhost:8899
```

Save the program ID from the output!

### Step 5: Create Test SPL Token (for Litter token)

```bash
# Create token mint
spl-token create-token --url http://localhost:8899

# Note the token address, e.g., TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ys62cocV

# Create token account
spl-token create-account <TOKEN_MINT_ADDRESS> --url http://localhost:8899

# Mint initial supply
spl-token mint <TOKEN_MINT_ADDRESS> 1000000 <YOUR_TOKEN_ACCOUNT> --url http://localhost:8899
```

### Step 6: Initialize the Program

Create a test script `test-initialize.ts`:

```typescript
import { Connection, Keypair, PublicKey, Transaction } from '@solana/web3.js';
import { Program, AnchorProvider, BN } from '@coral-xyz/anchor';
import bs58 from 'bs58';

async function testInitialize() {
  // Connect to local Surfpool
  const connection = new Connection('http://localhost:8899');
  const keypair = Keypair.fromSecretKey(
    bs58.decode(fs.readFileSync('~/.config/solana/id.json'))
  );

  // Program ID (update after deployment)
  const programId = new PublicKey('YOUR_DEPLOYED_PROGRAM_ID');

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    programId
  );

  const [virtualPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('virtual_pool')],
    programId
  );

  // Create initialize instruction
  const initializeParams = {
    graduationThreshold: new BN(1000 * 1_000_000), // 1000 USDC
    virtualInitialUsdc: new BN(100 * 1_000_000),   // 100 USDC
    virtualInitialLitter: new BN(1_000_000 * 1_000_000), // 1M LITTER
  };

  // Build and send transaction
  const tx = new Transaction().add(
    new TransactionInstruction({
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: virtualPoolPda, isSigner: false, isWritable: true },
        { pubkey: keypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: Buffer.from([
        0, // IX_INITIALIZE discriminator
        ...Buffer.from(initializeParams.graduationThreshold.toArray('little', 8)),
        ...Buffer.from(initializeParams.virtualInitialUsdc.toArray('little', 8)),
        ...Buffer.from(initializeParams.virtualInitialLitter.toArray('little', 8)),
      ]),
      programId,
    })
  );

  const signature = await connection.sendTransaction(tx, [keypair]);
  await connection.confirmTransaction(signature);
  
  console.log('✅ Initialize successful:', signature);
}

testInitialize().catch(console.error);
```

### Step 7: Test Deposit

```bash
# After initialization, test deposit
# (Create similar test script for deposit instruction)
```

## Surfpool Commands Reference

```bash
# Start Surfpool
surfpool run [options]

# Options:
# --rpc-port <port>        RPC port (default: 8899)
# --ws-port <port>         WebSocket port (default: 8899)
# --airdrop-amount <n>     SOL per airdrop (default: 100)
# --plugins <list>         Comma-separated plugins
# --config <file>          Config file path

# Available plugins:
# - token      SPL Token program
# - memo       Memo program
# - system     System program
# - associated-token  Associated Token program
```

## Alternative: Solana Test Validator (Simpler)

If Surfpool is too much, use the basic test validator:

```bash
# Install if needed
solana-install init stable

# Start validator
solana-test-validator

# In another terminal:
solana airdrop 100 --url http://localhost:8899
solana program deploy target/deploy/litterbox_pinocchio.so --url http://localhost:8899
```

## Testing Checklist

- [ ] Surfpool starts without errors
- [ ] Can airdrop SOL successfully
- [ ] Program deploys successfully
- [ ] Can derive correct PDAs
- [ ] Initialize instruction works
- [ ] Deposit instruction works
- [ ] Sweep instruction works
- [ ] Graduation logic works
- [ ] All error codes trigger correctly

## Common Issues

### "Connection refused"
**Solution:** Make sure Surfpool is running before trying to connect.

### "Program deployment failed"**
**Solution:** Check that you built with `cargo build-sbf` first.

### "Insufficient funds"**
**Solution:** Run `solana airdrop 100 --url http://localhost:8899`

### "Account data too small"**
**Solution:** PDAs need proper space allocation. Config needs 86 bytes, VirtualPool needs 41 bytes.

## Next Steps After Local Testing

1. ✅ Test locally with Surfpool
2. Deploy to devnet
3. Test on devnet with real tokens
4. Security audit
5. Mainnet deployment

---

**Ready to start?** Run:
```bash
surfpool run --rpc-port 8899 --plugins token
```

Then deploy your program and test! 🏄‍♂️
