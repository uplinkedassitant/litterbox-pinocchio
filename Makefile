.PHONY: build deploy test clean

# Build for on-chain deployment
build:
	cargo build-sbf --sbf-out-dir ./target/deploy

# Build for local testing
build-local:
	cargo build

# Deploy to cluster
deploy:
	solana program deploy target/deploy/litterbox_pinocchio.so

# Deploy to devnet
deploy-devnet:
	solana program deploy target/deploy/litterbox_pinocchio.so \
		--url devnet \
		--keypair ~/.config/solana/id.json

# Deploy to mainnet-beta
deploy-mainnet:
	solana program deploy target/deploy/litterbox_pinocchio.so \
		--url mainnet-beta \
		--keypair ~/.config/solana/id.json

# Run tests
test:
	cargo test

# Run on-chain tests
test-sbf:
	cargo test-sbf

# Clean build artifacts
clean:
	cargo clean
	rm -rf target

# Initialize program (example)
init-program:
	# Example: Initialize with threshold=1000 USDC, initial reserves
	# This would be called via solana invoke or a client script
	@echo "Use a client script to call initialize instruction"

# Check code format
fmt:
	cargo fmt

# Lint
lint:
	cargo clippy

# Build release with optimizations
build-release:
	cargo build-sbf --sbf-out-dir ./target/deploy --release

# Show program info
program-info:
	solana program show 8LhTE9owPwbdJMHbE7Nwi9i2H66JsPHzjwWbKPgLUa7t

# Upgrade program
upgrade-program:
	solana program upgrade 8LhTE9owPwbdJMHbE7Nwi9i2H66JsPHzjwWbKPgLUa7t target/deploy/litterbox_pinocchio.so
