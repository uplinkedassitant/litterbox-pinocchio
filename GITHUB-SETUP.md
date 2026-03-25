# GitHub Repository Setup - Quick Guide

## Automated Setup (Recommended)

Run the initialization script:

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio
chmod +x init-repo.sh
./init-repo.sh
```

This script will:
1. ✅ Initialize git repository
2. ✅ Configure git user (if needed)
3. ✅ Stage all files
4. ✅ Create initial commit
5. ✅ Help you add GitHub remote
6. ✅ Push to GitHub (optional)

## Manual Setup

### 1. Configure Git (First Time)

```bash
# Set your GitHub username
git config --global user.name "your-username"

# Set your email (must match GitHub account)
git config --global user.email "your-email@example.com"
```

### 2. Initialize Repository

```bash
cd /home/jay/.openclaw/workspace/litterbox-pinocchio

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: LitterBox v2 Pinocchio implementation"
```

### 3. Create GitHub Repository

**Option A: GitHub CLI**
```bash
gh repo create litterbox-pinocchio --public --source=. --remote=origin --push
```

**Option B: GitHub Web Interface**
1. Go to https://github.com/new
2. Repository name: `litterbox-pinocchio`
3. Description: "LitterBox v2 - Zero-Capital Auto-LP Launchpad on Solana"
4. Visibility: Public or Private
5. **Do NOT** initialize with README
6. Click "Create repository"

Then:
```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/litterbox-pinocchio.git

# Rename branch
git branch -M main

# Push to GitHub
git push -u origin main
```

## What's Included

The repository will contain:

### Core Files
- `src/lib.rs` - Program implementation
- `Cargo.toml` - Rust dependencies
- `.gitignore` - Git ignore rules

### Documentation
- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `INSTALL.md` - Installation instructions
- `LOCAL_TESTING.md` - Local testing setup
- `TESTING-GUIDE.md` - Testing reference
- `PROJECT_SUMMARY.md` - Project summary
- `SETUP.md` - Detailed setup guide
- `GITHUB-SETUP.md` - This file

### Scripts
- `scripts/check-dependencies.sh` - Check dependencies
- `scripts/test-local.sh` - Local test script
- `init-repo.sh` - Repository initialization

## Security

The `.gitignore` file prevents committing:
- ❌ Private keys (`*.keypair`, `*.key`, `*.pem`)
- ❌ JSON files with credentials
- ❌ Environment files (`.env`)
- ❌ Build artifacts (`target/`)
- ❌ Node modules
- ❌ IDE settings

## After Setup

### Make Changes

```bash
# Make your changes
# Stage them
git add .

# Commit
git commit -m "Description of changes"

# Push
git push
```

### Create a New Branch

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes
git add .
git commit -m "Add feature"

# Push branch
git push -u origin feature/your-feature
```

### Pull Request

1. Push your feature branch
2. Go to GitHub repository
3. Click "Compare & pull request"
4. Add description
5. Create pull request

## Repository URL

After setup, your repository will be at:
```
https://github.com/YOUR_USERNAME/litterbox-pinocchio
```

## Sharing

You can share:
- Repository URL
- Clone URL: `https://github.com/YOUR_USERNAME/litterbox-pinocchio.git`
- SSH URL: `git@github.com:YOUR_USERNAME/litterbox-pinocchio.git`

## Next Steps

1. ✅ Run `./init-repo.sh` or follow manual steps
2. ✅ Push to GitHub
3. ✅ Add repository description and topics
4. ✅ Enable GitHub Issues (Settings → Features)
5. ✅ Add collaborators (Settings → Collaborators)
6. ✅ Set up branch protection (Settings → Branches)
7. ✅ Enable Dependabot alerts (Security tab)

## GitHub Topics

Add these topics to your repository:
- `solana`
- `pinocchio`
- `defi`
- `launchpad`
- `rust`
- `blockchain`
- `crypto`

## Questions?

- Check `SETUP.md` for detailed instructions
- Review `README.md` for project overview
- See `DEPLOYMENT.md` for deployment steps

---

**Ready?** Run `./init-repo.sh` to get started! 🚀
