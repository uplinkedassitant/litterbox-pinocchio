/**
 * LitterBox v2 - Phase 1 Test Script
 * Verifies setup and derives PDAs
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function phase1Setup() {
  console.log('=== PHASE 1: Setup & Verification ===\n');

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

  console.log('✓ Connected to Surfpool');
  console.log('  RPC: http://localhost:8899');
  console.log('');
  
  // Wallet info
  console.log('Wallet Information:');
  console.log(`  Address: ${wallet.publicKey.toString()}`);
  const balance = await connection.getBalance(wallet.publicKey);
  console.log(`  Balance: ${(balance / 1e9).toFixed(4)} SOL`);
  console.log('');

  // Program ID
  const programId = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');
  console.log('Program Information:');
  console.log(`  Program ID: ${programId.toString()}`);
  
  // Verify program is deployed
  const programAccount = await connection.getAccountInfo(programId);
  if (programAccount) {
    console.log('  ✓ Program is deployed');
    console.log(`  Size: ${programAccount.data.length} bytes`);
  } else {
    console.log('  ✗ Program not found!');
    process.exit(1);
  }
  console.log('');

  // Derive PDAs
  console.log('Derived PDAs:');
  
  const [configPda, configBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    programId
  );
  console.log(`  Config PDA: ${configPda.toString()} (bump: ${configBump})`);

  const [poolPda, poolBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('virtual_pool')],
    programId
  );
  console.log(`  VirtualPool PDA: ${poolPda.toString()} (bump: ${poolBump})`);

  const [usdcVaultPda, usdcVaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('usdc_vault')],
    programId
  );
  console.log(`  USDC Vault PDA: ${usdcVaultPda.toString()} (bump: ${usdcVaultBump})`);

  const [litterVaultPda, litterVaultBump] = PublicKey.findProgramAddressSync(
    [Buffer.from('litter_vault')],
    programId
  );
  console.log(`  Litter Vault PDA: ${litterVaultPda.toString()} (bump: ${litterVaultBump})`);
  console.log('');

  // Check if accounts exist
  console.log('Account Status:');
  
  const configAccount = await connection.getAccountInfo(configPda);
  console.log(`  Config: ${configAccount ? '✓ Exists' : '✗ Not initialized'}`);

  const poolAccount = await connection.getAccountInfo(poolPda);
  console.log(`  VirtualPool: ${poolAccount ? '✓ Exists' : '✗ Not initialized'}`);
  console.log('');

  // Summary
  console.log('=== PHASE 1 COMPLETE ===');
  console.log('✓ Environment verified');
  console.log('✓ PDAs derived');
  console.log('✓ Ready for Phase 2: Initialize');
  console.log('');
  console.log('Next step: Run test-phase2-initialize.js');

  return {
    connection,
    wallet,
    programId,
    configPda,
    poolPda,
    usdcVaultPda,
    litterVaultPda,
  };
}

// Run if called directly
if (require.main === module) {
  phase1Setup().catch(console.error);
}

module.exports = { phase1Setup };
