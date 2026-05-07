import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
});

interface GrantTarget {
  name: string;
  email: string;
  subject: string;
}

const grantTargets: GrantTarget[] = [
  { name: 'Superteam Nigeria', email: 'hello@superteam.fun', subject: 'Grant Application - ÒsánVault Africa' },
  { name: 'Gitcoin', email: 'grants@gitcoin.co', subject: 'Retroactive Grant - ÒsánVault Africa' },
  { name: 'Future Africa', email: 'funding@future.africa', subject: 'Pre-Seed Application - ÒsánVault' }
];

const grantApplication = (targetName: string) => `
Dear ${targetName} Team,

I am writing to apply for grant funding for ÒsánVault Africa - a compliance-first, blockchain-based real estate tokenization platform targeting pan-African markets.

**About ÒsánVault Africa:**
- Mission: Enable fractional real estate investment from $10 equivalent
- Founder: Olugbenga Ajayi (Nigerian Navy veteran, 11 years service)
- Primary Market: Nigeria (SEC ARIP Sandbox pathway)
- Secondary Markets: Ghana, Kenya, South Africa

**Technology Stack:**
- 7 Anchor/Rust smart contracts on Solana
- React + TypeScript frontend
- Node.js API with PostgreSQL + Redis
- Pyth Network oracle integration
- RBAC security architecture

**Key Achievements:**
- 7 production-ready smart contracts (Core, Lend, REITs, Minerals, Carbon, LandBank, Oracle)
- 29 passing security tests
- AutoInvest bot suite (LP Manager, DCA, Dividend DRIP, Portfolio Rebalancer)
- VPS hardening with fail2ban and UFW
- Mobile-responsive dashboard with API integration

**Funding Request:**
We are seeking $10,000 - $50,000 to cover:
- Security audit (external)
- Mainnet deployment costs
- Legal/compliance (SCUML registration)
- Community building

**Why This Matters:**
Africa has $320B+ in unrealized property value. ÒsánVault democratizes real estate investment, allowing anyone from $10 to own fractional property and receive on-chain dividends.

I would welcome the opportunity to discuss this further.

Best regards,
Olugbenga Ajayi
Founder & CEO, ÒsánVault Africa
Email: olugbenga.ajayi@osanvault.africa
`;

async function sendGrantApplication(target: GrantTarget) {
  console.log(`Sending to ${target.name}...`);
  
  try {
    await transporter.sendMail({
      from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
      to: target.email,
      subject: target.subject,
      text: grantApplication(target.name)
    });
    console.log(`✅ ${target.name}: Sent`);
    return true;
  } catch (e) {
    console.error(`❌ ${target.name}: Failed - ${e}`);
    return false;
  }
}

async function main() {
  const targetArg = process.argv[2];
  
  if (targetArg && targetArg !== 'all') {
    const target = grantTargets.find(t => t.name.toLowerCase().includes(targetArg.toLowerCase()));
    if (target) {
      await sendGrantApplication(target);
    } else {
      console.log('Available targets: superteam, gitcoin, future');
    }
    return;
  }
  
  // Send to all
  console.log('=== Sending Grant Applications ===\n');
  
  const results = await Promise.all(grantTargets.map(t => sendGrantApplication(t)));
  
  const sent = results.filter(r => r).length;
  console.log(`\n=== Complete: ${sent}/${grantTargets.length} sent ===`);
}

main();