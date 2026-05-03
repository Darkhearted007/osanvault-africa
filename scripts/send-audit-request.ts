import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
});

interface AuditFirm {
  name: string;
  email: string;
}

const auditFirms: AuditFirm[] = [
  { name: 'Certik', email: 'audit@certik.com' },
  { name: 'Hacken', email: 'partnership@hacken.io' },
  { name: 'OtterSec', email: 'hello@otter-sec.com' },
  { name: 'Halborn', email: 'info@halborn.com' }
];

const emailContent = (firmName: string) => `
Dear ${firmName} Team,

I am reaching out to request a security audit for our blockchain project.

**Project: ÒsánVault Africa**
- Platform: Solana (Anchor/Rust smart contracts)
- Type: Real estate tokenization / DeFi
- Token: OSANV (500M supply)
- Primary Market: Nigeria (SEC ARIP Sandbox pathway)

**Scope:**
- 7 smart contracts (Core, Lend, REITs, Minerals, Carbon, LandBank, Oracle)
- Backend API (Node.js/TypeScript)
- Frontend (React/TypeScript)
- Oracle integration (Pyth + Switchboard)

**Current Security Posture:**
- 29 internal security tests passing
- RBAC implemented across all contracts
- VPS hardening (fail2ban, UFW)
- Rate limiting, circuit breakers
- Liquidation engine with 25% threshold

**Documentation Available:**
- Security audit scope document
- Self-audit checklist
- Technical architecture overview

**Budget Range:** $7,000 - $20,000

Would you be able to provide a quote and timeline for a comprehensive security audit?

Best regards,
Olugbenga Ajayi
Founder & CEO, ÒsánVault Africa
Email: Olugbenga1000@gmail.com
Phone: +2347065056103
Website: osanvaultafrica.com
`;

async function sendToFirm(firm: AuditFirm) {
  console.log(`Sending to ${firm.name} (${firm.email})...`);
  
  try {
    await transporter.sendMail({
      from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
      to: firm.email,
      subject: `Security Audit Request - ÒsánVault Africa (Solana/DeFi)`,
      text: emailContent(firm.name)
    });
    console.log(`✅ ${firm.name}: Sent`);
    return true;
  } catch (error) {
    console.error(`❌ ${firm.name}: Failed - ${error}`);
    return false;
  }
}

async function main() {
  console.log('=== Sending Audit Requests to Security Firms ===\n');
  
  const results = await Promise.all(auditFirms.map(f => sendToFirm(f)));
  
  const sent = results.filter(r => r).length;
  console.log(`\n=== Complete: ${sent}/${auditFirms.length} sent ===`);
  
  // Also send to grant contacts
  const grantContacts = [
    { name: 'Superteam Nigeria', email: 'apply@superteam.fun' },
    { name: 'Gitcoin', email: 'grants@gitcoin.co' },
    { name: 'Future Africa', email: 'hello@future.africa' }
  ];
  
  console.log('\n=== Sending Grant Applications ===\n');
  
  const grantContent = (name: string) => `
Dear ${name} Team,

I am applying for grant funding for ÒsánVault Africa.

**Project:** Compliance-first, blockchain-based real estate tokenization
**Founder:** Olugbenga Ajayi (Nigerian Navy veteran)
**Market:** Nigeria, Ghana, Kenya, South Africa

**Achievements:**
- 7 production-ready smart contracts
- 29 passing security tests
- Security audit in progress
- 5 AutoInvest bots (LP Manager, DCA, DRIP, etc.)

**Funding Request:** $10,000 - $50,000
- External security audit
- Mainnet deployment
- SCUML registration

See attached security documentation.

Best regards,
Olugbenga Ajayi
Olugbenga1000@gmail.com
+2347065056103
  `;
  
  for (const contact of grantContacts) {
    console.log(`Sending to ${contact.name}...`);
    try {
      await transporter.sendMail({
        from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
        to: contact.email,
        subject: `Grant Application - ÒsánVault Africa`,
        text: grantContent(contact.name)
      });
      console.log(`✅ ${contact.name}: Sent`);
    } catch (e) {
      console.error(`❌ ${contact.name}: Failed`);
    }
  }
}

main();