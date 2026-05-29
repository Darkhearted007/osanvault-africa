import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
});

const body = `Dear Future Africa Team,

I am applying for pre-seed funding for ÒsánVault Africa.

**Project:** Compliance-first, blockchain-based real estate tokenization platform
**Founder:** Olugbenga Ajayi (Nigerian Navy veteran, Advanced Diploma in Security & Safety Management)
**Headquarters:** Nigeria (SEC ARIP Sandbox pathway)
**Website:** osanvaultafrica.com

**Mission:**
Enable fractional real estate investment from $10 equivalent across pan-African markets.

**Traction:**
- 7 smart contracts built and tested (Core, Lend, REITs, Minerals, Carbon, LandBank, Oracle)
- 29 security tests passing
- Security audit in progress with CertiK
- AutoInvest bot suite operational (5 bots)
- Mobile-responsive dashboard with API integration

**Market Opportunity:**
- $320B+ unrealized property value in Africa
- Nigeria SEC ARIP Sandbox pathway
- First-mover in compliant property tokenization

**Funding Ask:** $25,000 - $100,000

**Use of Funds:**
- Security audit: $10,000
- Mainnet deployment: $5,000
- Legal (SCUML, DAOP): $10,000
- Team expansion: $10,000+

**Why Future Africa:**
Your focus on African founders and technical innovation aligns with our vision. We believe ÒsánVault can be the platform that brings real estate wealth building to ordinary Africans.

I would love to discuss this opportunity.

Best regards,
Olugbenga Ajayi
Founder & CEO
Olugbenga1000@gmail.com
+2347065056103`;

transporter.sendMail({
  from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
  to: 'funding@future.africa',
  subject: 'Pre-Seed Application - ÒsánVault Africa',
  text: body
}).then(r => {
  console.log('SUCCESS:', r.messageId);
  process.exit(0);
}).catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});