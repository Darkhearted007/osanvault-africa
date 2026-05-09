# Anchor Development with Docker

## Setup Progress (May 9, 2026)

### Completed
- Docker Desktop installed and running
- Solana v1.18.26 Docker image available (solanalabs/solana:v1.18.26)
- All 7 Anchor programs synced with correct program IDs
- Keypair files generated for all programs
- Anchor.toml configured with all 7 programs (version 1.0.2)

### All 7 Program IDs
| Program | Program ID |
|---------|-----------|
| osanvault_core | 5bNkJDyJaE3rZ93ahWaA8MPTxQvCG6dC9jkTanLV2qRF |
| osanvault_lend | 3ZX5svRbpgvNVQXpwj7cQG2MZs97KVnV3azCkSiwU3CR |
| reits | EUJWumAPhQVeTK3CAuBKh9SFf1AvqrmvTty37RKJxmf1 |
| minerals | 6oNLPSirAwbmTohpfUtUk2UHSLfsVnvHguP9ZdwcGRzF |
| carbon | H2hzHypyQxJpDiGWgpYSDN56JdyLzpPkrHcAD2cxnZUb |
| landbank | FRsKDe4vdmRczcXSvub2oAgCgs4uo4LttxvXrwfg1NkT |
| oracle | 9x81xZ2Kqjc5zbVAsX7Kqwv4HSo1HSkWkC3LUorZ8n55 |

### Pending
- Build Docker image with Anchor CLI (network issue downloading binary)
- Run `anchor build` to compile all contracts
- Run `anchor test` to verify contracts

## Quick Start

### Option 1: Docker Compose (Recommended)
```powershell
docker-compose -f docker-compose.anchor.yml up -d
docker exec -it osanvault-builder bash
# Inside container:
anchor build
```

### Option 2: Download Anchor Binary Manually
1. Download from: https://github.com/solana-foundation/anchor/releases/download/v1.0.2/anchor-1.0.2-x86_64-unknown-linux-gnu
2. Save as `/usr/local/bin/anchor` and `chmod +x`
3. Run `anchor build`

### Option 3: Use Solana Docker Image + Manual Anchor Install
```bash
docker run -it --rm -v "${PWD}:/workspace" solanalabs/solana:v1.18.26 bash
# Inside container:
curl -fsSL https://github.com/solana-foundation/anchor/releases/download/v1.0.2/anchor-1.0.2-x86_64-unknown-linux-gnu -o /usr/local/bin/anchor
chmod +x /usr/local/bin/anchor
cd /workspace
anchor build
```

## Inside Container - Common Commands
```bash
anchor --version
anchor build
anchor test
anchor deploy --provider.cluster devnet
solana-test-validator
```

## Troubleshooting

### Docker Daemon Not Running
- Windows: Start Docker Desktop from Start Menu
- Check: `docker info` should return Server Version info
- If fails: Restart Docker Desktop, wait 60 seconds

### Network Issues Downloading Anchor
- Use GitHub CLI: `gh release download v1.0.2 -p anchor-*-linux-gnu -O /tmp/anchor`
- Or manually download and copy into container

### Permission Issues (Linux/Mac)
```bash
sudo docker run -it --rm ...
```