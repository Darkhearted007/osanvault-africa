# Anchor Development with Docker

## Quick Start

### 1. Start Docker Desktop
```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
# Wait 30-60 seconds for daemon to initialize
```

### 2. Run Anchor Container
```bash
# From project root
cd /path/to/osanvault-africa

# Run Anchor development container
docker run -it --rm \
  -v "${PWD}:/workspace" \
  -w /workspace \
  ghcr.io/coral-xyz/anchor:latest

# Or with specific version
docker run -it --rm \
  -v "${PWD}:/workspace" \
  -w /workspace \
  ghcr.io/coral-xyz/anchor:v0.30.1
```

### 3. Inside Container - Common Commands
```bash
# Check Anchor version
anchor --version

# Initialize new program
anchor init my-program

# Build all programs
anchor build

# Run tests
anchor test

# Deploy to devnet
anchor deploy

# Run local validator
solana-test-validator

# Build specific program
cd programs/osanvault_core
anchor build
```

## Project-Specific Workflow

### For osanvault-africa:
```bash
# Start local validator in one terminal
solana-test-validator

# In another terminal, run Anchor
docker run -it --rm \
  -v "$(pwd):/workspace" \
  ghcr.io/coral-xyz/anchor:latest

# Build contracts
anchor build

# Run tests
anchor test --skip-build
```

## Troubleshooting

### Docker Daemon Not Running
- Windows: Start Docker Desktop from Start Menu
- Check: `docker info` should return without errors
- If fails: Restart Docker Desktop, wait 60 seconds

### Permission Issues (Linux/Mac)
```bash
sudo docker run -it --rm ...
```

### Volume Mount Issues (Windows)
```powershell
# Use Windows-style path
docker run -it --rm -v C:\Users\HomePC\Osanvault\osanvault-africa:/workspace ghcr.io/coral-xyz/anchor:latest
```

## Pre-built Dev Environment

Instead of Docker, you can install:
- Solana CLI: https://docs.solanalabs.com/cli/install
- Anchor CLI: `cargo install anchor-cli` (requires Rust + C toolchain)

## Useful Links
- Anchor Docs: https://www.anchor-lang.com/
- Solana Docs: https://docs.solanalabs.com/
- Anchor GitHub: https://github.com/coral-xyz/anchor