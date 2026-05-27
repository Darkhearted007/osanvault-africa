import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
});

const body = `Dear Superteam Nigeria Team,

I am applying for grant funding for ÒsánVault Africa.

**Project:** Compliance-first, blockchain-based real estate tokenization
**Founder:** Olugbenga Ajayi (Nigerian Navy veteran, 11 years service)
**Market:** Nigeria, Ghana, Kenya, South Africa

**Mission:** Enable fractional real estate investment from $10 equivalent with on-chain dividend distribution.

**Achievements:**
- 7 production-ready Anchor/Rust smart contracts (Core, Lend, REITs, Minerals, Carbon, LandBank, Oracle)
- 29 passing internal security tests
- AutoInvest bot suite (5 bots: LP Manager, DCA, Dividend DRIP, Portfolio Rebalancer, Liquidation Monitor)
- Security audit in progress (CertiK contacted)
- RBAC security architecture across all contracts
- VPS hardening (fail2ban, UFW)
- Mobile-responsive dashboard with API integration

**Technology Stack:**
- Solana (Anchor/Rust)
- React + TypeScript frontend
- Node.js API with PostgreSQL + Redis
- Pyth Network oracle integration

**Funding Request:** $10,000 - $50,000

**Use of Funds:**
- External security audit ($7,000-$15,000)
- Mainnet deployment costs
- SCUML registration (Nigerian legal requirement)
- Community building

**Why This Matters:**
Africa has $320B+ in unrealized property value. ÒsánVault democratizes real estate investment, allowing anyone from $10 to own fractional property and receive on-chain dividends while building community wealth.

I would welcome the opportunity to discuss this further.

Best regards,
Olugbenga Ajayi
Founder & CEO, ÒsánVault Africa
Email: Olugbenga1000@gmail.com
Phone: +2347065056103
Website: osanvaultafrica.com`;

transporter.sendMail({
  from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
  to: 'hello@superteam.fun',
  subject: 'Grant Application - ÒsánVault Africa',
  text: body
}).then(r => {
  console.log('SUCCESS:', r.messageId);
  process.exit(0);
}).catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});