-- ÒsánVault Africa — Initial Database Schema
-- Compliance-first design: all tables include audit columns

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users / Investors
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address VARCHAR(64) UNIQUE,
  email VARCHAR(255) UNIQUE,
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  role VARCHAR(20) DEFAULT 'investor' CHECK (role IN ('investor', 'admin', 'property_manager')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  location VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  total_value NUMERIC(18, 2) NOT NULL,
  token_price NUMERIC(18, 6) NOT NULL,
  total_tokens INTEGER NOT NULL,
  tokens_sold INTEGER DEFAULT 0,
  annual_yield NUMERIC(5, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'fully_funded', 'closed')),
  ipfs_hash VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  tokens_purchased INTEGER NOT NULL,
  amount_paid NUMERIC(18, 2) NOT NULL,
  osanv_amount NUMERIC(18, 6),
  tx_signature VARCHAR(128),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dividends
CREATE TABLE IF NOT EXISTS dividends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id),
  user_id UUID REFERENCES users(id),
  amount NUMERIC(18, 6) NOT NULL,
  osanv_amount NUMERIC(18, 6),
  tx_signature VARCHAR(128),
  distributed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log (compliance requirement)
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  metadata JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_property ON investments(property_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- Seed: OSANV token metadata
CREATE TABLE IF NOT EXISTS token_config (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO token_config (key, value) VALUES
  ('token_name', 'OSANV'),
  ('token_blockchain', 'Solana'),
  ('token_type', 'SPL'),
  ('token_supply', '500000000'),
  ('platform_fee', '0.015'),
  ('aum_fee', '0.005'),
  ('secondary_market_fee', '0.003')
ON CONFLICT (key) DO NOTHING;

-- Construction Milestones
CREATE TABLE IF NOT EXISTS construction_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  percentage_of_total NUMERIC(5,2) NOT NULL,
  budget NUMERIC(18,2) NOT NULL,
  paid_amount NUMERIC(18,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'not_started'
    CHECK (status IN ('not_started','planning','in_progress','completed','verified')),
  sequence_order INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES users(id),
  escrow_released BOOLEAN DEFAULT FALSE,
  escrow_released_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform Summary View
CREATE OR REPLACE VIEW platform_summary AS
SELECT
  (SELECT COUNT(*) FROM properties WHERE status = 'active') as active_properties,
  (SELECT COUNT(*) FROM properties) as total_properties,
  (SELECT COALESCE(SUM(total_value), 0) FROM properties) as total_tvl,
  (SELECT COUNT(DISTINCT user_id) FROM investments WHERE status = 'confirmed') as total_investors,
  (SELECT COALESCE(SUM(amount_paid), 0) FROM investments WHERE status = 'confirmed') as total_invested,
  (SELECT COALESCE(SUM(amount), 0) FROM dividends) as total_dividends_paid,
  (SELECT COUNT(*) FROM construction_milestones WHERE status = 'completed') as completed_milestones,
  (SELECT COUNT(*) FROM construction_milestones WHERE status = 'in_progress') as active_milestones;

-- Milestone Indexes
CREATE INDEX IF NOT EXISTS idx_milestones_property ON construction_milestones(property_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON construction_milestones(status);
