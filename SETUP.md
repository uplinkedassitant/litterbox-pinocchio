# Repository Setup Instructions

## Quick Start

Follow these steps to initialize the Git repository and push to GitHub.

### Step 1: Configure Git (First Time Only)

```bash
# Set your GitHub username
git config --global user.name "your-username"

# Set your email (use the one associated with your GitHub account)
git config --global user.email "your-email@example.com"
```

### Step 2: Initialize Git Repository

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: LitterBox v2 Pinocchio implementation"
```

### Step 3: Create GitHub Repository

**Option A: Using GitHub CLI (if installed)**
```bash
# Create repository on GitHub
gh repo create litterbox-pinocchio --public --source=. --remote=origin --push
```

**Option B: Using GitHub Web Interface**
1. Go to https://github.com/new
2. Repository name: `litterbox-pinocchio`
3. Description: "LitterBox v2 - Zero-Capital Auto-LP Launchpad on Solana (Pinocchio)"
4. Choose Public or Private
5. **Do NOT** initialize with README (we already have one)
6. Click "Create repository"

Then follow the commands GitHub shows you:
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/litterbox-pinocchio.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Verify Repository

```bash
# Check git status
git status

# Check remote
git remote -v

# View commit history
git log --oneline
```

## Git Configuration

### Global Configuration (One-time setup)

```bash
# Set your identity
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Optional: Set default branch name
git config --global init.defaultBranch main

# Optional: Use SSH for GitHub
git config --global url."git@github.com:".insteadOf "https://github.com/"
```

### Check Current Configuration

```bash
git config --global --list
```

## Pushing to GitHub

### Using HTTPS

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/litterbox-pinocchio.git

# Push
git push -u origin main
```

### Using SSH (Recommended)

```bash
# Generate SSH key (if you don't have one)
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add to GitHub: Settings → SSH and GPG keys → New SSH key
# Copy your public key
cat ~/.ssh/id_ed25519.pub

# Add remote with SSH
git remote add origin git@github.com:YOUR_USERNAME/litterbox-pinocchio.git

# Push
git push -u origin main
```

## Making Updates

After making changes to the code:

```bash
# Check what changed
git status

# Stage changes
git add .

# Commit
git commit -m "Description of changes"

# Push to GitHub
git push
```

## Branching Strategy

```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make changes, then commit
git add .
git commit -m "Add your feature"

# Push branch
git push -u origin feature/your-feature-name

# Merge to main (on GitHub or locally)
git checkout main
git merge feature/your-feature-name
```

## Ignored Files

The `.gitignore` file ensures these are NOT committed:
- `/target/` - Build artifacts
- `*.keypair` - Private keys
- `*.json` - JSON files (except config)
- `.env` files - Environment variables
- `node_modules/` - Node dependencies
- IDE settings

## GitHub Actions (Optional)

Create `.github/workflows/ci.yml` for automated testing:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Install Rust
      uses: actions-rs/toolchain@v1
      with:
        toolchain: stable
        target: wasm32-unknown-unknown
        override: true
    
    - name: Install Solana
      uses: metadaoproject/setup-solana@v1
    
    - name: Build
      run: cargo build-sbf
      
    - name: Test
      run: cargo test
```

## Repository Settings

After creating the repository on GitHub:

1. **Enable Issues**: Settings → Features → Issues ✓
2. **Add Topics**: Add `solana`, `pinocchio`, `defi`, `launchpad`
3. **Set Description**: "Zero-Capital Auto-LP Launchpad on Solana"
4. **Website**: Add project website if available
5. **License**: Already included (MIT)
6. **Security**: Enable Dependabot alerts

## Collaboration

### Adding Collaborators

1. Go to Settings → Collaborators
2. Add GitHub username
3. They'll receive an invitation

### Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
<!-- Describe your changes -->

## Testing
<!-- How did you test this? -->

## Checklist
- [ ] Code compiles
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes
```

## Next Steps

1. ✅ Configure git
2. ✅ Initialize repository
3. ✅ Create GitHub repo
4. ✅ Push initial commit
5. ✅ Set up branch protection (optional)
6. ✅ Enable GitHub Actions (optional)
7. ✅ Add repository to your GitHub profile

---

**Need help?** Check:
- [Git Documentation](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com)
- [Solana Developer Guide](https://solana.com/developers)
