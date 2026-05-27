@echo off
REM ÒsánVault Africa - Deploy All Programs to Solana Devnet
REM Usage: scripts\deploy-all.bat

echo.
echo ========================================================
echo        OSANVAULT AFRICA - PROGRAM DEPLOYMENT
echo ========================================================
echo.

REM Check for solana CLI
where solana >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Solana CLI not found
    echo Please install from: https://docs.solanalabs.com/cli/installation
    echo.
    echo Quick install via PowerShell:
    echo   iwr -Uri "https://release.solana.com/v1.18.1/solana-release-x86_64-pc-windows-msvc.zip" -OutFile "solana.zip"
    echo   unzip solana.zip
    echo   Add the bin folder to your PATH
    echo.
    pause
    exit /b 1
)

echo Solana CLI found:
solana --version
echo.

REM Set network to devnet
echo Setting network to devnet...
solana config set --url https://api.devnet.solana.com
solana config get
echo.

REM Check wallet
echo Deploy wallet address:
solana address
echo.

REM Check balance
echo Wallet balance:
solana balance
echo.

set /p confirm="Deploy all 7 programs to devnet? (y/n): "
if /i not "%confirm%"=="y" (
    echo Deployment cancelled.
    exit /b 0
)

echo.
echo Step 1: Build Programs
echo ========================================================
echo.

REM Check for anchor or cargo
where anchor >nul 2>nul
if %errorlevel% equ 0 (
    echo Building with Anchor CLI...
    anchor build
) else (
    echo Anchor not found. Building with cargo...
    where cargo >nul 2>nul
    if %errorlevel% neq 0 (
        echo ERROR: Neither anchor nor cargo found
        exit /b 1
    )
    cargo build --manifest-path programs\osanvault_core\Cargo.toml --release
    cargo build --manifest-path programs\osanvault_lend\Cargo.toml --release
    cargo build --manifest-path programs\reits\Cargo.toml --release
    cargo build --manifest-path programs\minerals\Cargo.toml --release
    cargo build --manifest-path programs\carbon\Cargo.toml --release
    cargo build --manifest-path programs\landbank\Cargo.toml --release
    cargo build --manifest-path programs\oracle\Cargo.toml --release
)

echo.
echo Step 2: Deploy Programs
echo ========================================================
echo.

REM Program IDs from Anchor.toml
set CORE_ID=5bNkJDyJaE3rZ93ahWaA8MPTxQvCG6dC9jkTanLV2qRF
set LEND_ID=3ZX5svRbpgvNVQXpwj7cQG2MZs97KVnV3azCkSiwU3CR
set REITS_ID=EUJWumAPhQVeTK3CAuBKh9SFf1AvqrmvTty37RKJxmf1
set MINERALS_ID=6oNLPSirAwbmTohpfUtUk2UHSLfsVnvHguP9ZdwcGRzF
set CARBON_ID=H2hzHypyQxJpDiGWgpYSDN56JdyLzpPkrHcAD2cxnZUb
set LANDBANK_ID=FRsKDe4vdmRczcXSvub2oAgCgs4uo4LttxvXrwfg1NkT
set ORACLE_ID=9x81xZ2Kqjc5zbVAsX7Kqwv4HSo1HSkWkC3LUorZ8n55

set PROGRAMS=osanvault_core osanvault_lend reits minerals carbon landbank oracle
set IDS=%CORE_ID% %LEND_ID% %REITS_ID% %MINERALS_ID% %CARBON_ID% %LANDBANK_ID% %ORACLE_ID%

echo NOTE: Manual deployment required via:
echo   solana program deploy ^<program.so^> --keypair ^<keypair.json^>
echo.
echo Program IDs:
echo   osanvault_core: %CORE_ID%
echo   osanvault_lend: %LEND_ID%
echo   reits:          %REITS_ID%
echo   minerals:       %MINERALS_ID%
echo   carbon:         %CARBON_ID%
echo   landbank:       %LANDBANK_ID%
echo   oracle:         %ORACLE_ID%
echo.

echo Step 3: Fund Deploy Wallet
echo ========================================================
echo To deploy, you need approximately 0.5 SOL per program (3.5 SOL total)
echo.
echo Get devnet SOL: solana airdrop 2
echo.
echo After funding, run:
echo   solana program deploy programs\osanvault_core\target\deploy\osanvault_core.so
echo   solana program deploy programs\osanvault_lend\target\deploy\osanvault_lend.so
echo   ... (repeat for all programs)
echo.

echo ════════════════════════════════════════════════════════
echo DEPLOYMENT PREP COMPLETE
echo ════════════════════════════════════════════════════════
echo.
echo Save these Program IDs for your frontend .env:
echo.
echo VITE_PROGRAM_CORE=%CORE_ID%
echo VITE_PROGRAM_LEND=%LEND_ID%
echo VITE_PROGRAM_REITS=%REITS_ID%
echo VITE_PROGRAM_MINERALS=%MINERALS_ID%
echo VITE_PROGRAM_CARBON=%CARBON_ID%
echo VITE_PROGRAM_LANDBANK=%LANDBANK_ID%
echo VITE_PROGRAM_ORACLE=%ORACLE_ID%
echo.

pause