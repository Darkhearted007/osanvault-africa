require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Connection, PublicKey, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const { Token, TOKEN_PROGRAM_ID } = require('@solana/spl-token');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed');
const netMint = new PublicKey(process.env.NET_TOKEN_MINT);
const ownerWallet = new PublicKey(process.env.OWNER_WALLET);

// On-chain simulation store
const staking = {};
const investments = {};
const votes = {};
const vaults = {};

// Health check
app.get('/', (req, res) => res.send('ÒsánVault Africa Devnet backend running'));

// Wallet balance
app.get('/balance/:pubkey', async (req, res) => {
  try {
    const pubkey = new PublicKey(req.params.pubkey);
    const balance = await connection.getBalance(pubkey);
    res.json({ wallet: pubkey.toBase58(), lamports: balance });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Stake NET tokens on-chain
app.post('/stake', async (req, res) => {
  try {
    const { wallet, amount } = req.body;
    staking[wallet] = (staking[wallet] || 0) + amount;
    // Placeholder: Here you can integrate real SPL token transfer
    res.json({ wallet, amount, totalStaked: staking[wallet], status: 'staked', timestamp: Date.now() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Fractional property investment (tokenized)
app.post('/invest', async (req, res) => {
  try {
    const { wallet, propertyId, amount } = req.body;
    investments[propertyId] = investments[propertyId] || {};
    investments[propertyId][wallet] = (investments[propertyId][wallet] || 0) + amount;
    res.json({ wallet, propertyId, amount, totalInvested: investments[propertyId][wallet], status: 'invested', timestamp: Date.now() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DAO-lite voting
app.post('/vote', async (req, res) => {
  try {
    const { wallet, proposalId, vote } = req.body;
    votes[proposalId] = votes[proposalId] || {};
    votes[proposalId][wallet] = vote;
    res.json({ wallet, proposalId, vote, status: 'recorded', timestamp: Date.now() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Vault deposit with yield
app.post('/vault/deposit', async (req, res) => {
  try {
    const { wallet, amount } = req.body;
    vaults[wallet] = (vaults[wallet] || 0) + amount;
    const yieldAmount = vaults[wallet] * 0.02; // 2% simulated yield
    res.json({ wallet, deposited: amount, total: vaults[wallet], yield: yieldAmount, timestamp: Date.now() });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`ÒsánVault Africa Devnet backend running at http://localhost:${port}`));
