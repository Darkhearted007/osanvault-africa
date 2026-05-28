import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
});

// Correct audit firm contacts via their websites
const auditNote = `
---

NOTE: Please request audit via your website form:
- Certik: https://certik.com/products/security-audit
- Hacken: https://hacken.io/contact-us/
- OtterSec: https://otter-sec.com/contact
- Halborn: https://halborn.com/contact

Also CC'ing: Olugbenga1000@gmail.com

---

I have submitted requests via your website contact forms. Please see my project details below:

PROJECT: ÒsánVault Africa
- Platform: Solana (Anchor/Rust smart contracts)
- 7 smart contracts ready for audit
- 29 passing security tests
- Primary market: Nigeria (SEC ARIP Sandbox)

BUDGET: $7,000 - $20,000

Looking forward to your response.
`;

const emailContent = (firmName: string) => `
Dear ${firmName} Team,

I have submitted an audit request via your website. Writing to follow up.

PROJECT: ÒsánVault Africa - Solana/DeFi Real Estate Tokenization

SCOPE:
- 7 smart contracts (Core, Lend, REITs, Minerals, Carbon, LandBank, Oracle)
- Backend API (Node.js)
- Frontend (React)
- Oracle integration (Pyth + Switchboard)

SECURITY:
- 29 internal tests passing
- RBAC implemented
- Liquidation engine (25% threshold)
- VPS hardening complete

BUDGET: $7,000 - $20,000

Website: osanvaultafrica.com

Best regards,
Olugbenga Ajayi
Founder, ÒsánVault Africa
`;

async function resend() {
  // Send to yourself as note that forms are needed
  await transporter.sendMail({
    from: '"ÒsánVault" <Olugbenga1000@gmail.com>',
    to: 'Olugbenga1000@gmail.com',
    subject: 'Action Required - Use Website Forms for Audit Firms',
    text: `The previous emails failed because audit firms use website contact forms, not direct email.

Please complete forms at:
1. Certik: https://certik.com/products/security-audit
2. Hacken: https://hacken.io/contact-us/
3. OtterSec: https://otter-sec.com/contact
4. Halborn: https://halborn.com/contact

Include the project details from email-drafts/ folder.

For grants, verify emails:
- Superteam: Check superteam.fun for current application portal
- Gitcoin: Check gitcoin.co/grants
- Future Africa: Check future.africa`
  });
  
  console.log('✅ Note sent - use website forms');
}

resend();