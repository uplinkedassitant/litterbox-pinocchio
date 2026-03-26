/**
 * LitterBox v2 - Simple Initialization with Keypairs
 * Creates regular keypair accounts (not PDAs) and initializes them
 */

const {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction,
} = require('@solana/web3.js');
const fs = require('fs');

const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

async function initializeWithKeypairs() {
  console.log('=== LitterBox v2 - Simple Keypair Initialization ===\n');

  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
  
  const wallet = Keypair.fromSecretKey(
    new Uint8Array(
      JSON.parse(
        fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8')
      )
    )
  );

  console.log('Environment:');
  console.log(`  Network: Devnet`);
  console.log(`  Program ID: ${PROGRAM_ID.toBase58()}`);
  console.log(`  Wallet: ${wallet.publicKey.toBase58()}`);
  console.log('');

  // Check program is deployed
  const programAccount = await connection.getAccountInfo(PROGRAM_ID);
  if (!programAccount || programAccount.data.length === 0) {
    console.log('✗ Program not deployed!');
    return { success: false, error: 'Program not deployed' };
  }
  console.log(`✓ Program verified (${programAccount.data.length} bytes)`);
  console.log('');

  // Generate keypairs for accounts
  const configKeypair = Keypair.generate();
  const poolKeypair = Keypair.generate();

  console.log('Generated Accounts:');
  console.log(`  Config: ${configKeypair.publicKey.toBase58()}`);
  console.log(`  VirtualPool: ${poolKeypair.publicKey.toBase58()}`);
  console.log('');

  // Calculate rent
  const configRent = await connection.getMinimumBalanceForRentExemption(86);
  const poolRent = await connection.getMinimumBalanceForRentExemption(41);

  console.log('Rent Costs:');
  console.log(`  Config: ${(configRent / 1e9).toFixed(6)} SOL`);
  console.log(`  VirtualPool: ${(poolRent / 1e9).toFixed(6)} SOL`);
  console.log('');

  // Create accounts instruction
  const createConfigIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: configKeypair.publicKey,
    lamports: configRent,
    space: 86,
    programId: PROGRAM_ID,
  });

  const createPoolIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: poolKeypair.publicKey,
    lamports: poolRent,
    space: 41,
    programId: PROGRAM_ID,
  });

  // Initialize instruction data
  const data = Buffer.alloc(1 + 8 + 8 + 8);
  data.writeUInt8(0, 0); // discriminator
  data.writeBigUInt64LE(BigInt(1000 * 1_000_000), 1); // graduation: 1000 USDC
  data.writeBigUInt64LE(BigInt(100 * 1_000_000), 9);  // virtual_usdc: 100 USDC
  data.writeBigUInt64LE(BigInt(1_000_000 * 1_000_000), 17); // virtual_litter: 1M

  const initializeIx = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // authority
      { pubkey: configKeypair.publicKey, isSigner: true, isWritable: true }, // config
      { pubkey: poolKeypair.publicKey, isSigner: true, isWritable: true }, // pool
      { pubkey: wallet.publicKey, isSigner: false, isWritable: false }, // litter_mint (dummy)
    ],
    programId: PROGRAM_ID,
    data,
  });

  // Send transaction
  const transaction = new Transaction()
    .add(createConfigIx)
    .add(createPoolIx)
    .add(initializeIx);

  transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  transaction.feePayer = wallet.publicKey;

  console.log('Creating accounts and initializing...');
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet, configKeypair, poolKeypair]
  );

  console.log(`✓ Transaction: ${signature}`);
  console.log('');
  console.log('=== INITIALIZATION COMPLETE! ===');
  console.log('');
  console.log('Account Addresses:');
  console.log(`  Config: ${configKeypair.publicKey.toBase58()}`);
  console.log(`  VirtualPool: ${poolKeypair.publicKey.toBase58()}`);
  console.log('');
  console.log('Explorer Links:');
  console.log(`  Config: https://explorer.solana.com/address/${configKeypair.publicKey.toBase58()}?cluster=devnet`);
  console.log(`  Pool: https://explorer.solana.com/address/${poolKeypair.publicKey.toBase58()}?cluster=devnet`);
  console.log(`  Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  console.log('');

  return { 
    success: true, 
    configPubkey: configKeypair.publicKey.toBase58(),
    poolPubkey: poolKeypair.publicKey.toBase58(),
    signature 
  };
}

if (require.main === module) {
  initializeWithKeypairs()
    .then(result => {
      if (!result.success) {
        console.error('Failed:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Error:', err.message);
      process.exit(1);
    });
}

module.exports = { initializeWithKeypairs };
