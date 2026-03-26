/**
 * LitterBox v2 - Phase 2: Initialize
 * Creates Config and VirtualPool accounts via System Program, then initializes them
 */

const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  SystemProgram,
} = require('@solana/web3.js');
const fs = require('fs');

// Instruction discriminator
const IX_INITIALIZE = 0;

async function phase2Initialize() {
  console.log('=== PHASE 2: Initialize ===\n');

  // Connect to Surfpool
  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  // Load wallet
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(
        fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8')
      )
    )
  );

  // Program ID
  const programId = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

  // Derive PDAs
  const [configPda, configBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    programId
  );

  const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('virtual_pool')],
    programId
  );

  console.log('Initialization Parameters:');
  console.log(`  Graduation Threshold: 1,000 USDC`);
  console.log(`  Virtual Initial USDC: 100 USDC`);
  console.log(`  Virtual Initial LITTER: 1,000,000 LITTER`);
  console.log('');

  // Initialize parameters
  const graduationThreshold = BigInt(1000 * 1_000_000);
  const virtualInitialUsdc = BigInt(100 * 1_000_000);
  const virtualInitialLitter = BigInt(1_000_000 * 1_000_000);

  // Account sizes
  const configSpace = 86;
  const poolSpace = 41;

  console.log('Creating accounts via System Program...');
  console.log(`  Config: ${configPda.toString()} (${configSpace} bytes)`);
  console.log(`  VirtualPool: ${poolPda.toString()} (${poolSpace} bytes)`);
  console.log('');

  // Create initialize instruction data
  const initializeData = Buffer.alloc(24);
  initializeData.writeBigUInt64LE(graduationThreshold, 0);
  initializeData.writeBigUInt64LE(virtualInitialUsdc, 8);
  initializeData.writeBigUInt64LE(virtualInitialLitter, 16);

  // Build transaction
  const transaction = new Transaction();

  // 1. Create Config account using createAccountWithSeed
  const configLamports = await connection.getMinimumBalanceForRentExemption(configSpace);
  transaction.add(
    SystemProgram.createAccountWithSeed({
      fromPubkey: wallet.publicKey,
      basePubkey: wallet.publicKey,
      seed: 'config',
      newAccountPubkey: configPda,
      lamports: configLamports,
      space: configSpace,
      programId: programId,
    })
  );

  // 2. Create VirtualPool account using createAccountWithSeed
  const poolLamports = await connection.getMinimumBalanceForRentExemption(poolSpace);
  transaction.add(
    SystemProgram.createAccountWithSeed({
      fromPubkey: wallet.publicKey,
      basePubkey: wallet.publicKey,
      seed: 'virtual_pool',
      newAccountPubkey: poolPda,
      lamports: poolLamports,
      space: poolSpace,
      programId: programId,
    })
  );

  // 3. Call initialize instruction
  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: poolPda, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: initializeData,
      programId: programId,
    })
  );

  console.log('Sending initialization transaction...');
  
  try {
    const signature = await connection.sendTransaction(transaction, [wallet]);
    console.log(`  Signature: ${signature}`);
    console.log('');

    // Wait for confirmation
    console.log('Waiting for confirmation...');
    await connection.confirmTransaction(signature, 'confirmed');
    console.log('  ✓ Transaction confirmed');
    console.log('');

    // Verify accounts
    console.log('Verifying account states...');
    
    const configAccount = await connection.getAccountInfo(configPda);
    if (configAccount) {
      console.log(`  ✓ Config account created`);
      console.log(`    Size: ${configAccount.data.length} bytes`);
      console.log(`    Discriminator: ${configAccount.data[0]} (expected: 1)`);
    } else {
      console.log(`  ✗ Config account not found!`);
    }

    const poolAccount = await connection.getAccountInfo(poolPda);
    if (poolAccount) {
      console.log(`  ✓ VirtualPool account created`);
      console.log(`    Size: ${poolAccount.data.length} bytes`);
      console.log(`    Discriminator: ${poolAccount.data[0]} (expected: 2)`);
    } else {
      console.log(`  ✗ VirtualPool account not found!`);
    }
    console.log('');

    console.log('=== PHASE 2 COMPLETE ===');
    console.log('✓ Accounts initialized successfully');
    console.log('✓ Ready for Phase 3: Deposit');
    console.log('');
    console.log('Next step: Run test-phase3-deposit.js');

    return { signature, configPda, poolPda };
  } catch (err) {
    console.error('Error:', err.message);
    console.log('');
    console.log('This may be expected if accounts already exist.');
    console.log('Checking if accounts exist...');
    
    const configExists = await connection.getAccountInfo(configPda);
    const poolExists = await connection.getAccountInfo(poolPda);
    
    if (configExists && poolExists) {
      console.log('  ✓ Both accounts exist (may need to reinitialize)');
      console.log('');
      console.log('=== PHASE 2 COMPLETE (accounts exist) ===');
      return { configPda, poolPda };
    }
    
    throw err;
  }
}

// Run if called directly
if (require.main === module) {
  phase2Initialize().catch((err) => {
    console.error('Phase 2 failed:', err.message);
    process.exit(1);
  });
}

module.exports = { phase2Initialize };
