require('dotenv').config(); // Load .env

const express = require('express');
const fs = require('fs');
const path = require('path');
const { PublicKey, Connection, clusterApiUrl, Keypair } = require('@solana/web3.js');
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ===== SOLANA SETUP =====
const NET_MINT_ADDRESS = new PublicKey(process.env.NET_TOKEN_MINT);
const NET_WALLET_PATH = path.resolve(__dirname, 'net-wallet.json');

let NET_WALLET;
if (fs.existsSync(NET_WALLET_PATH)) {
  const secretKey = JSON.parse(fs.readFileSync(NET_WALLET_PATH));
  NET_WALLET = Keypair.fromSecretKey(new Uint8Array(secretKey));
} else {
  console.error('NET wallet file not found. Please create net-wallet.json');
  process.exit(1);
}

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// ===== TELEGRAM BOT SETUP =====
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// ===== OPENAI SETUP =====
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ===== EXPRESS SETUP =====
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ===== ROUTES =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/wallet', async (req, res) => {
  const balance = await connection.getBalance(NET_WALLET.publicKey);
  res.json({ publicKey: NET_WALLET.publicKey.toBase58(), balance });
});

app.post('/ai', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const response = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }]
    });

    res.json({ reply: response.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

app.get('/real-estate', async (req, res) => {
  try {
    const apiKey = process.env.REAL_ESTATE_API_KEY;
    const response = await fetch(`https://api.example.com/properties?apiKey=${apiKey}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch real estate data' });
  }
});

// ===== TELEGRAM MESSAGE ROUTE =====
app.post('/notify', async (req, res) => {
  const message = req.body.message || 'No message provided';
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!chatId) return res.status(400).json({ error: 'TELEGRAM_CHAT_ID not set in .env' });

  try {
    await bot.sendMessage(chatId, message);
    res.json({ status: 'Message sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Telegram message failed' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`ÒsánVault Africa server running on port ${PORT}`);
});
