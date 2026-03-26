/**
 * LitterBox v2 - Full Initialization with Token Mint
 * Creates:
 * 1. Litter token mint (SPL Token)
 * 2. Config and VirtualPool accounts
 * 3. Initializes the program
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

const {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  ACCOUNT_SIZE,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
} = require('@solana/spl-token');

const fs = require('fs');

const PROGRAM_ID = new PublicKey('B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr');

async function initializeWithTokens() {
  console.log('=== LitterBox v2 - Full Token Initialization ===\n');

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

  // Step 1: Create Litter Token Mint
  console.log('Step 1: Creating Litter Token Mint...');
  const litterMintKeypair = Keypair.generate();
  const litterMint = litterMintKeypair.publicKey;
  
  const mintRent = await connection.getMinimumBalanceForRentExemption(MINT_SIZE);
  
  const createMintIx = SystemProgram.createAccount({
    fromPubkey: wallet.publicKey,
    newAccountPubkey: litterMint,
    lamports: mintRent,
    space: MINT_SIZE,
    programId: TOKEN_PROGRAM_ID,
  });
  
  const initializeMintIx = createInitializeMintInstruction(
    litterMint,
    6, // decimals
    wallet.publicKey, // mint authority
    null, // freeze authority
    TOKEN_PROGRAM_ID
  );
  
  const tx1 = new Transaction().add(createMintIx).add(initializeMintIx);
  tx1.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx1.feePayer = wallet.publicKey;
  
  await sendAndConfirmTransaction(connection, tx1, [wallet, litterMintKeypair]);
  console.log(`  ✓ Litter Mint: ${litterMint.toBase58()}`);
  console.log('');

  // Step 2: Create wallet's Litter ATA
  console.log('Step 2: Creating wallet Litter ATA...');
  const walletLitterAta = await getAssociatedTokenAddress(litterMint, wallet.publicKey, false, TOKEN_PROGRAM_ID);
  
  const createAtaIx = createAssociatedTokenAccountInstruction(
    wallet.publicKey,
    walletLitterAta,
    wallet.publicKey,
    litterMint,
    TOKEN_PROGRAM_ID
  );
  
  const tx2 = new Transaction().add(createAtaIx);
  tx2.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx2.feePayer = wallet.publicKey;
  
  await sendAndConfirmTransaction(connection, tx2, [wallet]);
  console.log(`  ✓ Wallet Litter ATA: ${walletLitterAta.toBase58()}`);
  
  // Mint initial supply
  console.log('  Minting initial Litter supply (1 billion tokens)...');
  const mintIx = createMintToInstruction(
    litterMint,
    walletLitterAta,
    wallet.publicKey,
    BigInt(1_000_000_000 * 1_000_000), // 1 billion with 6 decimals
    [],
    TOKEN_PROGRAM_ID
  );
  
  const tx3 = new Transaction().add(mintIx);
  tx3.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx3.feePayer = wallet.publicKey;
  
  await sendAndConfirmTransaction(connection, tx3, [wallet]);
  console.log('  ✓ Minted 1,000,000,000 LITTER tokens');
  console.log('');

  // Step 3: Generate keypairs for program accounts
  const configKeypair = Keypair.generate();
  const poolKeypair = Keypair.generate();

  console.log('Step 3: Creating Program Accounts...');
  console.log(`  Config: ${configKeypair.publicKey.toBase58()}`);
  console.log(`  VirtualPool: ${poolKeypair.publicKey.toBase58()}`);
  console.log('');

  // Calculate rent
  const configRent = await connection.getMinimumBalanceForRentExemption(86);
  const poolRent = await connection.getMinimumBalanceForRentExemption(41);

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
  data.writeBigUInt64LE(BigInt(1_000_000_000 * 1_000_000), 17); // virtual_litter: 1B LITTER

  const initializeIx = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true }, // authority
      { pubkey: configKeypair.publicKey, isSigner: true, isWritable: true }, // config
      { pubkey: poolKeypair.publicKey, isSigner: true, isWritable: true }, // pool
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

  console.log('Step 4: Initializing program...');
  const signature = await sendAndConfirmTransaction(
    connection,
    transaction,
    [wallet, configKeypair, poolKeypair]
  );

  console.log(`✓ Transaction: ${signature}`);
  console.log('');
  console.log('=== INITIALIZATION COMPLETE! ===');
  console.log('');
  console.log('Token Information:');
  console.log(`  Litter Mint: ${litterMint.toBase58()}`);
  console.log(`  Initial Supply: 1,000,000,000 LITTER`);
  console.log(`  Wallet Balance: 1,000,000,000 LITTER`);
  console.log('');
  console.log('Program Accounts:');
  console.log(`  Config: ${configKeypair.publicKey.toBase58()}`);
  console.log(`  VirtualPool: ${poolKeypair.publicKey.toBase58()}`);
  console.log('');
  console.log('Explorer Links:');
  console.log(`  Litter Mint: https://explorer.solana.com/address/${litterMint.toBase58()}?cluster=devnet`);
  console.log(`  Config: https://explorer.solana.com/address/${configKeypair.publicKey.toBase58()}?cluster=devnet`);
  console.log(`  Pool: https://explorer.solana.com/address/${poolKeypair.publicKey.toBase58()}?cluster=devnet`);
  console.log(`  Tx: https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  console.log('');

  // Save configuration
  const config = {
    litterMint: litterMint.toBase58(),
    configAccount: configKeypair.publicKey.toBase58(),
    poolAccount: poolKeypair.publicKey.toBase58(),
    walletLitterAta: walletLitterAta.toBase58(),
    programId: PROGRAM_ID.toBase58(),
  };

  fs.writeFileSync(
    '.litterbox-config.json',
    JSON.stringify(config, null, 2)
  );
  console.log('✓ Configuration saved to .litterbox-config.json');
  console.log('');

  return { 
    success: true, 
    litterMint: litterMint.toBase58(),
    configPubkey: configKeypair.publicKey.toBase58(),
    poolPubkey: poolKeypair.publicKey.toBase58(),
    signature 
  };
}

if (require.main === module) {
  initializeWithTokens()
    .then(result => {
      if (!result.success) {
        console.error('Failed:', result.error);
        process.exit(1);
      }
    })
    .catch(err => {
      console.error('Error:', err.message);
      console.error(err.stack);
      process.exit(1);
    });
}

module.exports = { initializeWithTokens };
