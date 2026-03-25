#!/bin/bash
# LitterBox v2 - Initialize Git Repository
# This script sets up the git repository and prepares it for GitHub

set -e

echo "🚀 LitterBox v2 - Git Repository Setup"
echo "======================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    echo "   Ubuntu/Debian: sudo apt-get install git"
    echo "   macOS: brew install git"
    exit 1
fi

echo "✅ Git found: $(git --version)"
echo ""

# Check if already initialized
if [ -d ".git" ]; then
    echo "⚠️  Git repository already exists"
    echo ""
    read -p "Do you want to reinitialize? (y/N): " choice
    case "$choice" in
        y|Y )
            echo "Removing existing .git directory..."
            rm -rf .git
            ;;
        * )
            echo "Skipping initialization"
            echo ""
            ;;
    esac
fi

# Initialize repository
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
    echo ""
fi

# Check git configuration
if [ -z "$(git config user.name)" ]; then
    echo "⚠️  Git user.name not configured"
    echo "   Please run: git config --global user.name \"Your Name\""
    echo ""
    read -p "Set git user.name now? (leave blank to skip): " username
    if [ -n "$username" ]; then
        git config user.name "$username"
        echo "✅ Set user.name: $username"
    fi
fi

if [ -z "$(git config user.email)" ]; then
    echo "⚠️  Git user.email not configured"
    echo "   Please run: git config --global user.email \"your.email@example.com\""
    echo ""
    read -p "Set git user.email now? (leave blank to skip): " email
    if [ -n "$email" ]; then
        git config user.email "$email"
        echo "✅ Set user.email: $email"
    fi
fi

echo ""
echo "📝 Staging all files..."
git add .
echo "✅ Files staged"
echo ""

# Show what will be committed
echo "📋 Files to be committed:"
git status --short
echo ""

# Create initial commit
echo "📝 Creating initial commit..."
git commit -m "Initial commit: LitterBox v2 Pinocchio implementation

- Core program structure with Pinocchio
- Build configuration and dependencies
- Documentation (README, DEPLOYMENT, INSTALL, TESTING guides)
- Git ignore rules for security
- Test scripts and utilities
- GitHub setup instructions"

echo "✅ Initial commit created"
echo ""

# Check if remote exists
if [ -z "$(git remote get-url origin 2>/dev/null)" ]; then
    echo "⚠️  No remote repository configured"
    echo ""
    echo "To push this to GitHub, you need to:"
    echo ""
    echo "1. Create a repository on GitHub:"
    echo "   - Go to: https://github.com/new"
    echo "   - Repository name: litterbox-pinocchio"
    echo "   - Description: 'LitterBox v2 - Zero-Capital Auto-LP Launchpad on Solana'"
    echo "   - Do NOT initialize with README"
    echo "   - Click 'Create repository'"
    echo ""
    echo "2. Then add the remote and push:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/litterbox-pinocchio.git"
    echo "   git branch -M main"
    echo "   git push -u origin main"
    echo ""
    read -p "Add remote now? (leave blank to skip): " add_remote
    if [ -n "$add_remote" ]; then
        read -p "Enter GitHub username: " gh_user
        read -p "Enter repository name (default: litterbox-pinocchio): " repo_name
        repo_name=${repo_name:-litterbox-pinocchio}
        
        git remote add origin https://github.com/$gh_user/$repo_name.git
        echo "✅ Remote added: origin"
        
        read -p "Push to main branch now? (y/N): " push_now
        if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
            git branch -M main
            git push -u origin main
            echo "✅ Pushed to GitHub"
        else
            echo "ℹ️  You can push later with: git push -u origin main"
        fi
    fi
else
    echo "✅ Remote repository configured: $(git remote get-url origin)"
    echo ""
    read -p "Push to remote now? (y/N): " push_now
    if [ "$push_now" = "y" ] || [ "$push_now" = "Y" ]; then
        git branch -M main
        git push -u origin main
        echo "✅ Pushed to GitHub"
    fi
fi

echo ""
echo "======================================="
echo "✅ Repository setup complete!"
echo ""
echo "Next steps:"
echo "  - View commit history: git log --oneline"
echo "  - Check status: git status"
echo "  - Make changes and commit: git add . && git commit -m 'message'"
echo "  - Push changes: git push"
echo ""
echo "Documentation:"
echo "  - README.md - Project overview"
echo "  - SETUP.md - Detailed setup instructions"
echo "  - DEPLOYMENT.md - Deployment guide"
echo "  - INSTALL.md - Installation guide"
echo ""
