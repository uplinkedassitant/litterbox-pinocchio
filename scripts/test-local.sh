#!/bin/bash
# LitterBox v2 - Local Testing Script
# This script sets up local testing with Surfpool or basic test validator

set -e

PROGRAM_NAME="litterbox_v2"
PROGRAM_BINARY="./target/deploy/litterbox_pinocchio.so"
LOCAL_URL="http://localhost:8899"
WALLET_PATH="$HOME/.config/solana/id.json"

echo "🌊 LitterBox v2 - Local Testing Setup"
echo "======================================"

# Check if program is built
if [ ! -f "$PROGRAM_BINARY" ]; then
    echo "❌ Program not built. Building now..."
    cargo build-sbf --sbf-out-dir ./target/deploy
fi

echo "✅ Program binary found: $PROGRAM_BINARY"

# Check if Surfpool is installed
if command -v surfpool &> /dev/null; then
    echo "✅ Surfpool detected"
    USE_SURFPOOL=true
else
    echo "⚠️  Surfpool not found. Using solana-test-validator instead."
    echo "   Install with: npm install -g surfpool"
    USE_SURFPOOL=false
fi

# Check if solana-test-validator is running
if curl -s "$LOCAL_URL" > /dev/null 2>&1; then
    echo "✅ Local validator already running"
    VALIDATOR_RUNNING=true
else
    echo "⚠️  Local validator not running"
    VALIDATOR_RUNNING=false
fi

# Start validator if not running
if [ "$VALIDATOR_RUNNING" = false ]; then
    echo ""
    echo "🚀 Starting local validator..."
    
    if [ "$USE_SURFPOOL" = true ]; then
        # Start Surfpool in background
        surfpool run --rpc-port 8899 --plugins token &
        SURFPOOL_PID=$!
        echo "   Surfpool started (PID: $SURFPOOL_PID)"
        sleep 5  # Wait for Surfpool to start
    else
        # Start solana-test-validator in background
        solana-test-validator &
        VALIDATOR_PID=$!
        echo "   solana-test-validator started (PID: $VALIDATOR_PID)"
        sleep 5  # Wait for validator to start
    fi
fi

# Wait for validator to be ready
echo ""
echo "⏳ Waiting for validator to be ready..."
for i in {1..10}; do
    if curl -s "$LOCAL_URL" > /dev/null 2>&1; then
        echo "✅ Validator is ready!"
        break
    fi
    if [ $i -eq 10 ]; then
        echo "❌ Validator failed to start"
        exit 1
    fi
    sleep 1
done

# Check wallet
if [ ! -f "$WALLET_PATH" ]; then
    echo ""
    echo "🔑 Creating new keypair..."
    solana-keygen new --outfile "$WALLET_PATH" --no-passphrase
fi

WALLET_ADDRESS=$(solana address --keypair "$WALLET_PATH")
echo "✅ Wallet: $WALLET_ADDRESS"

# Airdrop SOL
echo ""
echo "💰 Airdropping SOL..."
solana airdrop 100 --url "$LOCAL_URL"

BALANCE=$(solana balance --url "$LOCAL_URL" | awk '{print $1}' | tr -d ' SOL')
echo "✅ Balance: $BALANCE SOL"

# Deploy program
echo ""
echo "📦 Deploying program..."
DEPLOY_OUTPUT=$(solana program deploy "$PROGRAM_BINARY" --url "$LOCAL_URL" 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract program ID
PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep -oP 'Program Id: \K[0-9A-Za-z]+' || echo "")
if [ -z "$PROGRAM_ID" ]; then
    PROGRAM_ID=$(echo "$DEPLOY_OUTPUT" | grep -oP '\K[0-9A-Za-z]{32,44}' | head -1)
fi

if [ -n "$PROGRAM_ID" ]; then
    echo "✅ Program ID: $PROGRAM_ID"
    echo ""
    echo "🎉 Setup complete!"
    echo ""
    echo "Next steps:"
    echo "  1. Update program ID in client code to: $PROGRAM_ID"
    echo "  2. Run test scripts against: $LOCAL_URL"
    echo "  3. Monitor logs: solana logs $PROGRAM_ID --url $LOCAL_URL"
else
    echo "⚠️  Could not extract program ID from deployment output"
fi

echo ""
echo "📋 Useful commands:"
echo "  - Check balance: solana balance --url $LOCAL_URL"
echo "  - View logs: solana logs --url $LOCAL_URL"
echo "  - Airdrop more: solana airdrop 100 --url $LOCAL_URL"
echo "  - Stop validator: pkill -f solana-test-validator"
