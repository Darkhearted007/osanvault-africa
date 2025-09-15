const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Connection, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const { getAccount } = require('@solana/spl-token');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'latest_files')));

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
const NET_MINT = new PublicKey(process.env.NET_MINT_ADDRESS);

// Token audit endpoint
app.get('/token-audit/:wallet', async (req, res) => {
    try {
        const wallet = new PublicKey(req.params.wallet);
        const tokenAccounts = await connection.getTokenAccountsByOwner(wallet, { mint: NET_MINT });
        const balances = await Promise.all(tokenAccounts.value.map(async (ta) => {
            const acc = await getAccount(connection, ta.pubkey);
            return { pubkey: ta.pubkey.toBase58(), amount: acc.amount };
        }));
        res.json({ wallet: wallet.toBase58(), balances });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Investor dashboard endpoint (example data)
app.get('/investor-dashboard/:wallet', async (req, res) => {
    try {
        const wallet = req.params.wallet;
        // Example: Fetch transaction history, token balances, referral points, etc.
        // Replace with real data source
        res.json({
            wallet,
            total_invested: 1000,
            total_tokens: 5000,
            referrals: 12,
            transaction_history: [
                { date: '2025-09-01', amount: 100, type: 'buy' },
                { date: '2025-09-05', amount: 50, type: 'sell' }
            ]
        });
    } catch(err) {
        res.status(500).json({ error: err.message });
    }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'latest_files', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 ÒsánVault Africa running at http://localhost:${PORT}`));
