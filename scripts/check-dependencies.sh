#!/bin/bash
# LitterBox v2 - Dependency Checker
# This script verifies all required dependencies are installed

set -e

echo "🔍 LitterBox v2 - Dependency Checker"
echo "===================================="
echo ""

ISSUES=0

# Check Rust
echo "1. Checking Rust..."
if command -v rustc &> /dev/null; then
    RUST_VERSION=$(rustc --version)
    echo "   ✅ Rust installed: $RUST_VERSION"
else
    echo "   ❌ Rust NOT found"
    echo "   Install: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    ISSUES=$((ISSUES + 1))
fi

# Check Cargo
echo ""
echo "2. Checking Cargo..."
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo "   ✅ Cargo installed: $CARGO_VERSION"
else
    echo "   ❌ Cargo NOT found"
    echo "   Install with Rust (see above)"
    ISSUES=$((ISSUES + 1))
fi

# Check cargo-build-sbf (Solana SBF toolchain)
echo ""
echo "3. Checking Solana SBF toolchain..."
if cargo build-sbf --help &> /dev/null; then
    echo "   ✅ cargo-build-sbf installed"
else
    echo "   ❌ cargo-build-sbf NOT found"
    echo "   Install: solana-install init stable"
    ISSUES=$((ISSUES + 1))
fi

# Check Solana CLI
echo ""
echo "4. Checking Solana CLI..."
if command -v solana &> /dev/null; then
    SOLANA_VERSION=$(solana --version)
    echo "   ✅ Solana CLI installed: $SOLANA_VERSION"
else
    echo "   ❌ Solana CLI NOT found"
    echo "   Install: sh -c \"\$(curl -sSfL https://release.anza.xyz/stable/install)\""
    ISSUES=$((ISSUES + 1))
fi

# Check solana-test-validator
echo ""
echo "5. Checking solana-test-validator..."
if command -v solana-test-validator &> /dev/null; then
    echo "   ✅ solana-test-validator installed"
else
    echo "   ❌ solana-test-validator NOT found"
    echo "   Install with Solana CLI (see above)"
    ISSUES=$((ISSUES + 1))
fi

# Check Node.js (for client scripts)
echo ""
echo "6. Checking Node.js (optional, for client scripts)..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js installed: $NODE_VERSION"
else
    echo "   ⚠️  Node.js NOT found (optional, but needed for TypeScript client)"
    echo "   Install: https://nodejs.org/"
fi

# Check npm
echo ""
echo "7. Checking npm (optional, for client scripts)..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "   ✅ npm installed: $NPM_VERSION"
else
    echo "   ⚠️  npm NOT found (optional, but needed for TypeScript client)"
fi

# Check Surfpool (optional)
echo ""
echo "8. Checking Surfpool (optional)..."
if command -v surfpool &> /dev/null; then
    SURFPOOL_VERSION=$(surfpool --version)
    echo "   ✅ Surfpool installed: $SURFPOOL_VERSION"
else
    echo "   ⚠️  Surfpool NOT found (optional, recommended for testing)"
    echo "   Install: npm install -g surfpool"
fi

# Check Docker (optional)
echo ""
echo "9. Checking Docker (optional)..."
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo "   ✅ Docker installed: $DOCKER_VERSION"
else
    echo "   ⚠️  Docker NOT found (optional, for containerized testing)"
fi

# Check make
echo ""
echo "10. Checking make..."
if command -v make &> /dev/null; then
    MAKE_VERSION=$(make --version | head -1)
    echo "   ✅ make installed: $MAKE_VERSION"
else
    echo "   ⚠️  make NOT found (optional, but useful)"
fi

# Summary
echo ""
echo "===================================="
if [ $ISSUES -eq 0 ]; then
    echo "✅ All REQUIRED dependencies installed!"
    echo ""
    echo "You can now:"
    echo "  1. Build: cargo build-sbf --sbf-out-dir ./target/deploy"
    echo "  2. Test: solana-test-validator"
    echo "  3. Deploy: solana program deploy target/deploy/litterbox_pinocchio.so --url localhost"
else
    echo "❌ Found $ISSUES issue(s) that need attention:"
    echo ""
    echo "REQUIRED (must fix):"
    if ! command -v rustc &> /dev/null; then
        echo "  - Install Rust"
    fi
    if ! command -v cargo &> /dev/null; then
        echo "  - Install Cargo (comes with Rust)"
    fi
    if ! cargo build-sbf --help &> /dev/null; then
        echo "  - Install Solana SBF toolchain: solana-install init stable"
    fi
    if ! command -v solana &> /dev/null; then
        echo "  - Install Solana CLI"
    fi
    
    echo ""
    echo "OPTIONAL (recommended but not required):"
    if ! command -v surfpool &> /dev/null; then
        echo "  - Surfpool (better local testing): npm install -g surfpool"
    fi
    if ! command -v node &> /dev/null; then
        echo "  - Node.js (for client scripts): https://nodejs.org/"
    fi
fi

echo ""
echo "For detailed installation instructions, see:"
echo "  - DEPLOYMENT.md"
echo "  - LOCAL_TESTING.md"
echo "  - README-TESTING.md"
