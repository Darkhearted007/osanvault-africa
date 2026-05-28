@echo off
REM ÒsánVault - OSANV Token Deployment Script for Windows
REM Requires Solana CLI installed

echo.
echo ========================================================
echo        OSANV TOKEN DEPLOYMENT - WINDOWS
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

REM Configuration
set MINT_AUTHORITY=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
set TOTAL_SUPPLY=500000000

echo Step 1: Set Network
echo Choose:
echo   1 - Mainnet Beta (production)
echo   2 - Devnet (testing)
set /p choice="Enter choice [1-2]: "

if "%choice%"=="1" (
    solana config set --url https://api.mainnet-beta.solana.com
) else (
    solana config set --url https://api.devnet.solana.com
)

echo.
echo Your wallet address:
solana address
echo.
set /p confirm="Is this the correct wallet? (y/n): "
if /i not "%confirm%"=="y" (
    echo Please configure correct wallet with: solana config set
    exit /b 1
)

echo.
echo Step 2: Check Balance
solana balance

echo.
echo Step 3: Create OSANV Token
echo Creating token with 9 decimals...
spl-token create-token --decimals 9

echo.
set /p MINT_ADDR="Enter the Mint Address from above: "

echo.
echo Step 4: Mint Tokens
spl-token mint %MINT_ADDR% %TOTAL_SUPPLY%

echo.
echo Step 5: Disable Mint Authority
spl-token authorize %MINT_ADDR% mint %MINT_AUTHORITY%

echo.
echo Step 6: Create Token Account
spl-token create-account %MINT_ADDR%

echo.
echo Step 7: Verify
echo ════════════════════════════════════════
echo Token: %MINT_ADDR%
echo Supply: 
spl-token supply %MINT_ADDR%
echo.
echo ════════════════════════════════════════
echo DEPLOYMENT COMPLETE!
echo.
echo Mint address: %MINT_ADDR% > .osanv-mint-address
echo Saved to .osanv-mint-address

pause