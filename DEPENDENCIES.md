# Dependencies Checklist - LitterBox v2 Pinocchio

## Quick Status Check

Run this command to check all dependencies:
```bash
./scripts/check-dependencies.sh
```

---

## Required Dependencies ✅

You **MUST** have these installed to build and deploy:

### 1. Rust & Cargo
- **What:** Programming language and package manager
- **Minimum:** Rust 1.75.0
- **Install:** `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Verify:** `rustc --version` && `cargo --version`

### 2. Solana CLI Tools
- **What:** Command-line tools for Solana
- **Minimum:** Solana 1.18.0
- **Install:** `sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"`
- **Verify:** `solana --version`

### 3. SBF Toolchain
- **What:** Solana SBF compiler for building programs
- **Install:** `solana-install init stable`
- **Verify:** `cargo build-sbf --help`

---

## Optional (Recommended) Dependencies ⚡

These make development and testing easier:

### 4. Node.js & npm
- **What:** For TypeScript client scripts
- **Minimum:** Node 18.0, npm 9.0
- **Install:** `curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - && sudo apt-get install -y nodejs`
- **Verify:** `node --version` && `npm --version`

### 5. Surfpool
- **What:** Enhanced local Solana validator with plugins
- **Install:** `npm install -g surfpool`
- **Verify:** `surfpool --version`

### 6. Docker (Optional)
- **What:** Containerized testing environment
- **Install:** https://docs.docker.com/get-docker/
- **Verify:** `docker --version`

---

## Installation Commands (Copy-Paste)

### Ubuntu/Debian - Full Install
```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Solana
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
source ~/.bashrc
solana-install init stable

# Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Surfpool
npm install -g surfpool

# Verify all
rustc --version
cargo --version
solana --version
node --version
surfpool --version
```

### macOS - Full Install
```bash
# Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Solana
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
source ~/.bashrc
solana-install init stable

# Node.js
brew install node

# Surfpool
npm install -g surfpool
```

---

## What Each Dependency Does

| Tool | Purpose | Used For |
|------|---------|----------|
| **rustc** | Rust compiler | Compiling program code |
| **cargo** | Rust package manager | Building, dependencies |
| **cargo-build-sbf** | SBF compiler | Building Solana programs |
| **solana** | Solana CLI | Deploying, airdrops, account management |
| **solana-test-validator** | Local validator | Local testing |
| **node** | JavaScript runtime | Running TypeScript client |
| **npm** | Node package manager | Installing dependencies |
| **surfpool** | Enhanced validator | Better local testing |
| **docker** | Containers | Isolated testing |

---

## After Installation

### 1. Configure Solana
```bash
solana config set --url devnet
solana-keygen new --outfile ~/.config/solana/id.json
```

### 2. Get Devnet SOL
```bash
solana airdrop 2 --url devnet
```

### 3. Build Program
```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio
cargo build-sbf --sbf-out-dir ./target/deploy
```

### 4. Test Locally
```bash
solana-test-validator &
sleep 5
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost
```

---

## Troubleshooting

### "command not found: rustc"
Rust not installed or not in PATH. Run:
```bash
source $HOME/.cargo/env
```

### "command not found: solana"
Solana not in PATH. Run:
```bash
export PATH="/home/YOUR_USERNAME/.local/share/solana/install/active_release/bin:$PATH"
```

### "cargo-build-sbf: command not found"
SBF toolchain not installed. Run:
```bash
solana-install init stable
```

### Permission errors on Linux
```bash
sudo chown -R $USER:$USER ~/.cargo
sudo chown -R $USER:$USER ~/.local/share/solana
```

---

## Version Check Commands

```bash
# Check Rust version
rustc --version

# Check Cargo version  
cargo --version

# Check Solana version
solana --version

# Check SBF toolchain
cargo build-sbf --version

# Check Node.js
node --version

# Check npm
npm --version

# Check Surfpool
surfpool --version

# Check Docker
docker --version
```

---

## Summary

**To build and deploy, you need:**
- ✅ Rust/Cargo (required)
- ✅ Solana CLI (required)
- ✅ SBF toolchain (required)

**For full development experience, also install:**
- ✅ Node.js + npm (recommended)
- ✅ Surfpool (recommended)
- ✅ Docker (optional)

**Run the checker:**
```bash
./scripts/check-dependencies.sh
```

This will tell you exactly what's installed and what's missing!

---

For detailed installation instructions, see:
- `INSTALL.md` - Complete installation guide
- `DEPLOYMENT.md` - Deployment instructions
- `LOCAL_TESTING.md` - Local testing setup
