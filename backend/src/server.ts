import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize Ethers provider
const rpcUrl = process.env.RPC_URL || 'https://rpc-amoy.polygon.technology';
const provider = new ethers.JsonRpcProvider(rpcUrl);

// ============ HEALTH CHECK ============
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============ USERS ============

/**
 * POST /api/auth/register
 * Register a new user with wallet address
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const { address, email } = req.body;
    if (!address || !ethers.isAddress(address)) {
      return res.status(400).json({ error: 'invalid address' });
    }
    // TODO: Insert into users table
    res.json({ user: { address, email, kyc_status: 'pending' } });
  } catch (err) {
    res.status(500).json({ error: 'registration failed' });
  }
});

/**
 * GET /api/users/:address
 * Get user profile by wallet address
 */
app.get('/api/users/:address', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'invalid address' });
    }
    // TODO: Query users table
    res.json({ address, kyc_status: 'approved', created_at: new Date() });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch user' });
  }
});

// ============ PROPERTIES ============

/**
 * GET /api/properties
 * List all available properties
 */
app.get('/api/properties', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    // TODO: Query properties table with pagination
    res.json({
      properties: [],
      total: 0,
      page: Number(page),
      limit: Number(limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch properties' });
  }
});

/**
 * GET /api/properties/:propertyId
 * Get single property details
 */
app.get('/api/properties/:propertyId', async (req: Request, res: Response) => {
  try {
    const { propertyId } = req.params;
    // TODO: Query properties table by ID
    res.json({
      id: propertyId,
      title: 'Sample Property',
      location: 'Lagos, Nigeria',
      price: '50000',
      risk_score: 75,
    });
  } catch (err) {
    res.status(500).json({ error: 'property not found' });
  }
});

// ============ INVESTMENTS ============

/**
 * GET /api/users/:address/portfolio
 * Get user portfolio (holdings + yields)
 */
app.get('/api/users/:address/portfolio', async (req: Request, res: Response) => {
  try {
    const { address } = req.params;
    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'invalid address' });
    }
    // TODO: Query investments + yield_claims for address
    res.json({
      address,
      holdings: [],
      total_invested: '0',
      total_yield_earned: '0',
      claimable_yield: '0',
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch portfolio' });
  }
});

/**
 * POST /api/investments/buy
 * Execute property purchase (creates DB record + calls contract)
 */
app.post('/api/investments/buy', async (req: Request, res: Response) => {
  try {
    const { buyer, propertyId, amount, signature } = req.body;
    // TODO: Verify signature
    // TODO: Create investment record in DB
    // TODO: Call marketplace.buyListing() via ethers
    res.json({
      status: 'pending',
      tx_hash: '0x...',
      buyer,
      propertyId,
      amount,
    });
  } catch (err) {
    res.status(500).json({ error: 'purchase failed' });
  }
});

// ============ EVENTS / LISTENERS ============

/**
 * GET /api/events/latest
 * Fetch latest contract events (trades, yields, etc)
 */
app.get('/api/events/latest', async (req: Request, res: Response) => {
  try {
    // TODO: Query events table for recent trades/claims
    res.json({ events: [] });
  } catch (err) {
    res.status(500).json({ error: 'failed to fetch events' });
  }
});

// ============ ERROR HANDLER ============
app.use((err: any, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log(`📡 RPC: ${rpcUrl}`);
});
