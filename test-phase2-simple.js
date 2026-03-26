/**
 * LitterBox v2 - Phase 2: Simple Initialize
 * Creates accounts using proper PDA approach
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
const bs58 = require('bs58');

const IX_INITIALIZE = 0;

async function phase2Initialize() {
  console.log('=== PHASE 2: Initialize (Simple) ===\n');

  const connection = new Connection('http://localhost:8899', 'confirmed');
  
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(
        fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8')
      )
    )
  );

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

  console.log('Parameters:');
  console.log(`  Graduation Threshold: 1000 USDC`);
  console.log(`  Initial USDC: 100 USDC`);
  console.log(`  Initial LITTER: 1000000 LITTER`);
  console.log('');

  // Create instruction data (discriminator + 3 u64 params)
  const data = Buffer.alloc(1 + 24);
  data.writeUInt8(IX_INITIALIZE, 0);
  data.writeBigUInt64LE(BigInt(1000 * 1_000_000), 1);      // graduation_threshold
  data.writeBigUInt64LE(BigInt(100 * 1_000_000), 9);       // virtual_initial_usdc
  data.writeBigUInt64LE(BigInt(1_000_000 * 1_000_000), 17); // virtual_initial_litter

  const configSpace = 86;
  const poolSpace = 41;

  const transaction = new Transaction();

  // Create Config account
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: configPda,
      lamports: await connection.getMinimumBalanceForRentExemption(configSpace),
      space: configSpace,
      programId: programId,
    })
  );

  // Create VirtualPool account  
  transaction.add(
    SystemProgram.createAccount({
      fromPubkey: wallet.publicKey,
      newAccountPubkey: poolPda,
      lamports: await connection.getMinimumBalanceForRentExemption(poolSpace),
      space: poolSpace,
      programId: programId,
    })
  );

  // Call initialize
  transaction.add(
    new TransactionInstruction({
      keys: [
        { pubkey: configPda, isSigner: false, isWritable: true },
        { pubkey: poolPda, isSigner: false, isWritable: true },
        { pubkey: wallet.publicKey, isSigner: true, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: data,
      programId: programId,
    })
  );

  console.log('Sending transaction...');
  
  try {
    const signature = await connection.sendTransaction(transaction, [wallet]);
    console.log(`  Signature: ${signature}`);
    
    console.log('Confirming...');
    await connection.confirmTransaction(signature, 'confirmed');
    console.log('  ✓ Confirmed');
    console.log('');

    // Verify
    const configInfo = await connection.getAccountInfo(configPda);
    const poolInfo = await connection.getAccountInfo(poolPda);

    console.log('Results:');
    console.log(`  Config: ${configInfo ? '✓ Created' : '✗ Missing'} (${configInfo?.data.length} bytes)`);
    console.log(`  VirtualPool: ${poolInfo ? '✓ Created' : '✗ Missing'} (${poolInfo?.data.length} bytes)`);
    console.log('');

    if (configInfo && poolInfo) {
      console.log('=== PHASE 2 SUCCESS ===');
      console.log('✓ Accounts initialized');
      console.log('✓ Ready for Phase 3: Deposit');
    }

    return { signature, configPda, poolPda };
  } catch (err) {
    console.error('Error:', err.message);
    
    // Check if already exists
    const configInfo = await connection.getAccountInfo(configPda);
    const poolInfo = await connection.getAccountInfo(poolPda);
    
    if (configInfo && poolInfo) {
      console.log('');
      console.log('Accounts already exist:');
      console.log(`  Config: ${configInfo.data.length} bytes, discriminator=${configInfo.data[0]}`);
      console.log(`  VirtualPool: ${poolInfo.data.length} bytes, discriminator=${poolInfo.data[0]}`);
      console.log('');
      console.log('=== PHASE 2 COMPLETE (already initialized) ===');
      return { configPda, poolPda };
    }
    
    throw err;
  }
}

if (require.main === module) {
  phase2Initialize().catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
  });
}

module.exports = { phase2Initialize };
