# Solana Program Deployment Guide

## Quick Start

### Prerequisites
1. **Solana CLI** installed
   ```bash
   sh -c "$(curl -sSfL https://release.solana.com/v1.18.26/install.sh)"
   ```
2. **~3.5 SOL** in devnet wallet for deployment fees

### Deployment Steps

#### 1. Check Wallet & Balance
```bash
solana config set --url https://api.devnet.solana.com
solana address
solana balance
```

#### 2. Fund Wallet (Devnet)
```bash
solana airdrop 2
# Repeat until you have ~4 SOL
solana balance
```

#### 3. Build Programs
```bash
# Using Anchor
anchor build

# Or manual cargo build
cargo build-sbf --manifest-path programs/osanvault_core/Cargo.toml
```

#### 4. Deploy Programs
```bash
# Each program needs ~0.5 SOL for deployment
solana program deploy programs/osanvault_core/target/deploy/osanvault_core.so
solana program deploy programs/osanvault_lend/target/deploy/osanvault_lend.so
solana program deploy programs/reits/target/deploy/reits.so
solana program deploy programs/minerals/target/deploy/minerals.so
solana program deploy programs/carbon/target/deploy/carbon.so
solana program deploy programs/landbank/target/deploy/landbank.so
solana program deploy programs/oracle/target/deploy/oracle.so
```

## Program IDs

| Program | Devnet ID | Status |
|---------|-----------|--------|
| osanvault_core | `5bNkJDyJaE3rZ93ahWaA8MPTxQvCG6dC9jkTanLV2qRF` | Ready |
| osanvault_lend | `3ZX5svRbpgvNVQXpwj7cQG2MZs97KVnV3azCkSiwU3CR` | Ready |
| reits | `EUJWumAPhQVeTK3CAuBKh9SFf1AvqrmvTty37RKJxmf1` | Ready |
| minerals | `6oNLPSirAwbmTohpfUtUk2UHSLfsVnvHguP9ZdwcGRzF` | Ready |
| carbon | `H2hzHypyQxJpDiGWgpYSDN56JdyLzpPkrHcAD2cxnZUb` | Ready |
| landbank | `FRsKDe4vdmRczcXSvub2oAgCgs4uo4LttxvXrwfg1NkT` | Ready |
| oracle | `9x81xZ2Kqjc5zbVAsX7Kqwv4HSo1HSkWkC3LUorZ8n55` | Ready |

## Frontend Environment Variables

After deployment, update `apps/web/.env`:

```env
VITE_PROGRAM_CORE=5bNkJDyJaE3rZ93ahWaA8MPTxQvCG6dC9jkTanLV2qRF
VITE_PROGRAM_LEND=3ZX5svRbpgvNVQXpwj7cQG2MZs97KVnV3azCkSiwU3CR
VITE_PROGRAM_REITS=EUJWumAPhQVeTK3CAuBKh9SFf1AvqrmvTty37RKJxmf1
VITE_PROGRAM_MINERALS=6oNLPSirAwbmTohpfUtUk2UHSLfsVnvHguP9ZdwcGRzF
VITE_PROGRAM_CARBON=H2hzHypyQxJpDiGWgpYSDN56JdyLzpPkrHcAD2cxnZUb
VITE_PROGRAM_LANDBANK=FRsKDe4vdmRczcXSvub2oAgCgs4uo4LttxvXrwfg1NkT
VITE_PROGRAM_ORACLE=9x81xZ2Kqjc5zbVAsX7Kqwv4HSo1HSkWkC3LUorZ8n55
```

## Scripts

- `scripts/deploy-all.sh` - Unix deployment script
- `scripts/deploy-all.bat` - Windows deployment script
- `scripts/setup-solana.sh` / `.bat` - Solana setup

## Troubleshooting

### Insufficient Funds
```bash
solana airdrop 2
# Get more from https://faucet.solana.com
```

### Build Errors
- Ensure Rust toolchain is up to date
- Check `Anchor.toml` version matches `Cargo.toml`
- GitHub Actions CI can build remotely (see `.github/workflows/anchor-build.yml`)

### Deployment Failures
- Some programs may already be deployed with that ID
- Use `--force` to overwrite: `solana program deploy <file> --force`
- Check program logs: `solana program show <PROGRAM_ID>`