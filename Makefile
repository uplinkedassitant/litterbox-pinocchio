.PHONY: build test clean check

# Build the SBF binary (.so) — this is what gets deployed
build:
	cargo build-sbf --features bpf-entrypoint --sbf-out-dir ./target/deploy

# Run unit tests on the host (no SBF toolchain required)
test:
	cargo test

# Type-check without SBF toolchain (fast feedback loop)
check:
	cargo check

# Type-check the entrypoint feature path too
check-bpf:
	cargo check --features bpf-entrypoint --target sbf-solana-solana

clean:
	cargo clean

# Deploy to surfpool devnet (set PROGRAM_ID env var first)
deploy:
	solana program deploy target/deploy/litterbox_pinocchio.so

# Show the .so size
size:
	ls -lh target/deploy/litterbox_pinocchio.so 2>/dev/null || echo "Not built yet"
