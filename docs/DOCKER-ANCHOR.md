# Anchor Development with Docker

## Setup Progress (May 9, 2026)

### Completed
- Docker Desktop installed and running
- Solana v1.18.26 Docker image available (solanalabs/solana:v1.18.26)
- All 7 Anchor programs synced with correct program IDs
- Keypair files generated for all programs
- Anchor.toml configured with all 7 programs (version 1.0.2)
- **GitHub Actions CI/CD workflow created** (`.github/workflows/anchor-ci.yml`)
- **Pre-built Docker image available**: `burgossrodrigo/anchor-build:0.30.1`

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

## GitHub Actions CI/CD (Recommended)

Use the pre-built Docker image with all fixes already applied:

```yaml
# .github/workflows/anchor-ci.yml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    container:
      image: burgossrodrigo/anchor-build:0.30.1

    env:
      CARGO_HOME: /root/.cargo
      RUSTUP_HOME: /root/.rustup

    steps:
      - uses: actions/checkout@v4
      - name: Generate keypair
        run: |
          mkdir -p $HOME/.config/solana
          solana-keygen new --outfile $HOME/.config/solana/id.json --no-bip39-passphrase --force
      - name: Build programs
        run: anchor build
      - name: Run tests
        run: anchor test
```

### Key CI Fixes (From Rodrigo Burgos)
| Issue | Fix |
|-------|-----|
| Agave 3.x + io_uring | Use `SOLANA_VERSION=v2.1.21` (v2.x no io_uring) |
| GLIBC mismatch | Use Ubuntu 24.04 + compile anchor from source |
| Cargo toolchain not found | Set `CARGO_HOME` and `RUSTUP_HOME` explicitly |
| Keypair wrong path | Use `$HOME/.config/solana/id.json` (not `/root`) |
| Validator startup too slow | Set `startup_wait = 60000` in Anchor.toml |
| Event listeners hang in CI | Fetch tx logs directly instead of addEventListener |

### Event Listener Fix (CI Alternative)
```typescript
import { BorshCoder } from "@coral-xyz/anchor";

const sig = await program.methods.bridgeSend(...).rpc();
const tx = await provider.connection.getTransaction(sig, {
  commitment: "confirmed",
  maxSupportedTransactionVersion: 0,
});
const events = tx.meta.logMessages
  .filter((log) => log.startsWith("Program data: "))
  .map((log) => {
    try {
      return new BorshCoder(IDL as any).events.decode(
        log.slice("Program data: ".length)
      );
    } catch {
      return null;
    }
  })
  .filter(Boolean);
```

## Local Development Options

### Option 1: Docker Compose (Recommended for Local)
```powershell
docker-compose -f docker-compose.anchor.yml up -d
docker exec -it osanvault-builder bash
# Inside container:
anchor build
```

### Option 2: Pre-built Image (Fastest Local)
```bash
docker run -it --rm -v "${PWD}:/workspace" burgossrodrigo/anchor-build:0.30.1
# Inside container:
anchor build
```

### Option 3: Build Own Docker Image
```dockerfile
# Dockerfile.anchor
FROM ubuntu:24.04

ENV SOLANA_VERSION=v2.1.21
RUN sh -c "$(curl -sSfL https://release.anza.xyz/${SOLANA_VERSION}/install)"
RUN cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked
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

### GLIBC Errors
- Anchor binary requires newer GLIBC than available
- Fix: Use pre-built image `burgossrodrigo/anchor-build:0.30.1` or build from source

### Permission Issues (Linux/Mac)
```bash
sudo docker run -it --rm ...
```