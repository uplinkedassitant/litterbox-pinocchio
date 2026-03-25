/**
 * LitterBox v2 - Pinocchio Version Client Example
 * 
 * This is a template for interacting with the Pinocchio-based LitterBox program.
 * Install dependencies: npm install @solana/web3.js bs58
 */

import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import bs58 from 'bs58';

// Program ID
const PROGRAM_ID = new PublicKey('8LhTE9owPwbdJMHbE7Nwi9i2H66JsPHzjwWbKPgLUa7t');

// Instruction discriminators
const INSTRUCTIONS = {
  INITIALIZE: 0,
  DEPOSIT_ANY_TOKEN: 1,
  SWEEP_AND_SWAP: 2,
  GRADUATE_TO_REAL: 3,
  FLUSH_TO_LP: 4,
} as const;

// Initialize params struct
interface InitializeParams {
  graduationThreshold: bigint;
  virtualInitialUsdc: bigint;
  virtualInitialLitter: bigint;
}

/**
 * Create initialize instruction
 */
function createInitializeInstruction(
  programId: PublicKey,
  configPda: PublicKey,
  virtualPoolPda: PublicKey,
  authority: PublicKey,
  params: InitializeParams
): TransactionInstruction {
  const data = Buffer.alloc(1 + 24); // 1 byte discriminator + 24 bytes params
  data.writeUInt8(INSTRUCTIONS.INITIALIZE, 0);
  data.writeBigUInt64LE(params.graduationThreshold, 1);
  data.writeBigUInt64LE(params.virtualInitialUsdc, 9);
  data.writeBigUInt64LE(params.virtualInitialLitter, 17);

  return new TransactionInstruction({
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: virtualPoolPda, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
    programId,
  });
}

/**
 * Create deposit instruction
 */
function createDepositInstruction(
  programId: PublicKey,
  configPda: PublicKey,
  virtualPoolPda: PublicKey,
  user: PublicKey,
  amountIn: bigint,
  minLitterOut: bigint
): TransactionInstruction {
  const data = Buffer.alloc(1 + 16); // 1 byte discriminator + 16 bytes params
  data.writeUInt8(INSTRUCTIONS.DEPOSIT_ANY_TOKEN, 0);
  data.writeBigUInt64LE(amountIn, 1);
  data.writeBigUInt64LE(minLitterOut, 9);

  return new TransactionInstruction({
    keys: [
      { pubkey: configPda, isSigner: false, isWritable: true },
      { pubkey: virtualPoolPda, isSigner: false, isWritable: true },
      { pubkey: user, isSigner: true, isWritable: true },
    ],
    data,
    programId,
  });
}

/**
 * Main execution example
 */
async function main() {
  // Setup connection
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Load keypair (replace with your keypair)
  const keypair = Keypair.fromSecretKey(
    bs58.decode('YOUR_SECRET_KEY_HERE')
  );

  console.log('Wallet:', keypair.publicKey.toString());

  // Derive PDAs
  const [configPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    PROGRAM_ID
  );

  const [virtualPoolPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('virtual_pool')],
    PROGRAM_ID
  );

  console.log('Config PDA:', configPda.toString());
  console.log('Virtual Pool PDA:', virtualPoolPda.toString());

  // Initialize program
  const initializeParams: InitializeParams = {
    graduationThreshold: BigInt(1000 * 1_000_000), // 1000 USDC
    virtualInitialUsdc: BigInt(100 * 1_000_000), // 100 USDC
    virtualInitialLitter: BigInt(1_000_000 * 1_000_000), // 1M LITTER
  };

  const initializeIx = createInitializeInstruction(
    PROGRAM_ID,
    configPda,
    virtualPoolPda,
    keypair.publicKey,
    initializeParams
  );

  const tx = new Transaction().add(initializeIx);
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.feePayer = keypair.publicKey;

  console.log('Sending initialize transaction...');
  const signature = await sendAndConfirmTransaction(connection, tx, [keypair]);
  console.log('Initialize signature:', signature);

  // Deposit example
  const depositIx = createDepositInstruction(
    PROGRAM_ID,
    configPda,
    virtualPoolPda,
    keypair.publicKey,
    BigInt(10_000_000), // 10 USDC
    BigInt(900_000) // Min litter out (adjust based on bonding curve)
  );

  const depositTx = new Transaction().add(depositIx);
  depositTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  depositTx.feePayer = keypair.publicKey;

  console.log('Sending deposit transaction...');
  const depositSig = await sendAndConfirmTransaction(connection, depositTx, [keypair]);
  console.log('Deposit signature:', depositSig);
}

// Run
main().catch(console.error);
