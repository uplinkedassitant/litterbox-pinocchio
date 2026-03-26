#!/bin/bash
# Derive PDAs for LitterBox v2

PROGRAM_ID="B3j1f4KLqEGq1VFnec5WUxg7ePMh9KFBPFBFnjDDpMvr"

echo "=== LitterBox v2 PDA Derivation ==="
echo "Program ID: $PROGRAM_ID"
echo ""

# Derive Config PDA
echo "Config PDA (seed: 'config'):"
CONFIG_PDA=$(solana address --keypair <(echo -n "config" | solana-keygen grind --search 1 --starts-with 1 2>/dev/null | grep "pubkey" | cut -d' ' -f1) 2>/dev/null || echo "Deriving manually...")

# Use a simple approach - create keypairs for seeds
echo "Creating temporary keypairs for PDA derivation..."

# Config PDA
CONFIG_SEED_FILE=$(mktemp)
echo -n "config" > $CONFIG_SEED_FILE
CONFIG_KEYPAIR=$(solana-keygen new --no-passphrase --silent --keypair-file $CONFIG_SEED_FILE 2>/dev/null || echo "failed")

echo ""
echo "Wallet Address: $(solana address --url http://localhost:8899)"
echo "Balance: $(solana balance --url http://localhost:8899)"
echo ""
echo "Ready for Phase 2: Initialize"
