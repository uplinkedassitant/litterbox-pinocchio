# Installation Guide - LitterBox v2

Complete guide to installing all dependencies for building and deploying the Pinocchio program.

## Quick Install (All Dependencies)

If you want to install everything at once:

```bash
# 1. Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# 2. Install Solana toolchain
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
source ~/.bashrc

# 3. Install Node.js (for client scripts)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Install Surfpool (optional, recommended)
npm install -g surfpool

# 5. Verify installation
cargo --version
solana --version
node --version
```

---

## Step-by-Step Installation

### 1. Install Rust (Required)

Rust is the programming language used for Solana programs.

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add to current shell
source $HOME/.cargo/env

# Verify
rustc --version
cargo --version
```

**Expected output:**
```
rustc 1.80.0 (or newer)
cargo 1.80.0 (or newer)
```

**Troubleshooting:**
- If you get "permission denied", try: `sudo chown -R $USER $HOME/.cargo`
- On Windows, use WSL2 or the Windows installer from rustup.rs

---

### 2. Install Solana Toolchain (Required)

The Solana CLI tools are needed for deployment.

```bash
# Install Solana
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Add to PATH (if not automatically added)
export PATH="/home/YOUR_USERNAME/.local/share/solana/install/active_release/bin:$PATH"

# Add to ~/.bashrc for persistence
echo 'export PATH="/home/YOUR_USERNAME/.local/share/solana/install/active_release/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify
solana --version
```

**Expected output:**
```
solana-cli 2.0.x (or newer)
```

**Install SBF toolchain:**
```bash
solana-install init stable
```

---

### 3. Install Node.js (Optional, for client scripts)

Node.js is needed if you want to use the TypeScript client examples.

**Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**macOS:**
```bash
brew install node
```

**Windows:**
Download from https://nodejs.org/

**Verify:**
```bash
node --version
npm --version
```

**Expected output:**
```
v20.x.x (or newer)
10.x.x (or newer)
```

---

### 4. Install Surfpool (Optional, Recommended)

Surfpool provides better local testing with plugins.

```bash
npm install -g surfpool

# Verify
surfpool --version
```

**Expected output:**
```
surfpool x.x.x
```

---

### 5. Install Docker (Optional)

Docker is useful for isolated testing environments.

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
```

**macOS:**
Download Docker Desktop: https://www.docker.com/products/docker-desktop/

**Verify:**
```bash
docker --version
docker-compose --version
```

---

## Verify Installation

Run the dependency checker script:

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio
./scripts/check-dependencies.sh
```

This will check all dependencies and tell you what's missing.

---

## Minimal vs Full Installation

### Minimal (Required to build and deploy)
- ✅ Rust/Cargo
- ✅ Solana CLI
- ✅ cargo-build-sbf (SBF toolchain)

### Recommended (for full development experience)
- ✅ All minimal dependencies
- ✅ Node.js (for TypeScript client)
- ✅ Surfpool (for better local testing)
- ✅ npm (for installing packages)

### Optional (nice to have)
- Docker (for containerized testing)
- make (for using Makefile)

---

## Post-Installation Setup

### 1. Configure Solana CLI

```bash
# Set default cluster (devnet for testing)
solana config set --url devnet

# Generate keypair if you don't have one
solana-keygen new --outfile ~/.config/solana/id.json

# View your wallet address
solana address
```

### 2. Get Devnet SOL

```bash
# Airdrop devnet SOL (free)
solana airdrop 2 --url devnet

# Check balance
solana balance --url devnet
```

### 3. Test Your Setup

```bash
# Navigate to project
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Build the program
cargo build-sbf --sbf-out-dir ./target/deploy

# Start local validator
solana-test-validator

# In another terminal, deploy
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost
```

---

## Common Installation Issues

### Issue: "Rust not found after installation"

**Solution:** Add Rust to your PATH:
```bash
source $HOME/.cargo/env
```

Or add to `~/.bashrc`:
```bash
export PATH="$HOME/.cargo/bin:$PATH"
```

### Issue: "Solana CLI not found"

**Solution:** Add Solana to PATH:
```bash
export PATH="/home/YOUR_USERNAME/.local/share/solana/install/active_release/bin:$PATH"
```

### Issue: "cargo-build-sbf not found"

**Solution:** Install SBF toolchain:
```bash
solana-install init stable
```

### Issue: Permission errors on Linux

**Solution:** Fix permissions:
```bash
sudo chown -R $USER:$USER ~/.cargo
sudo chown -R $USER:$USER ~/.local/share/solana
```

### Issue: Windows compatibility

**Solution:** Use WSL2 (Windows Subsystem for Linux):
```bash
# In PowerShell (as Administrator)
wsl --install

# Then install dependencies in WSL2 as normal Linux
```

---

## Version Requirements

| Tool | Minimum Version | Recommended |
|------|----------------|-------------|
| Rust | 1.75.0 | 1.80.0+ |
| Solana CLI | 1.18.0 | 2.0.x |
| Node.js | 18.0 | 20.x LTS |
| npm | 9.0 | 10.x |

---

## Next Steps After Installation

1. ✅ Verify all dependencies
2. ✅ Run dependency checker script
3. ✅ Build the program: `cargo build-sbf`
4. ✅ Test locally: `solana-test-validator`
5. ✅ Deploy to devnet

---

## Quick Reference

**Check all dependencies:**
```bash
./scripts/check-dependencies.sh
```

**Build program:**
```bash
cargo build-sbf --sbf-out-dir ./target/deploy
```

**Deploy to local:**
```bash
solana-test-validator &
solana program deploy target/deploy/litterbox_pinocchio.so --url localhost
```

**Deploy to devnet:**
```bash
solana program deploy target/deploy/litterbox_pinocchio.so --url devnet
```

---

Need help? Check:
- `DEPLOYMENT.md` - Full deployment guide
- `LOCAL_TESTING.md` - Local testing setup
- `README-TESTING.md` - Quick testing reference
