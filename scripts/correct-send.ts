import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
});

// Correct contact - Gitcoin support
async function sendGitcoin() {
  await transporter.sendMail({
    from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
    to: 'support@gitcoin.co',
    subject: 'Grant Application - ÒsánVault Africa (Blockchain Real Estate)',
    text: `Dear Gitcoin Team,

I am applying for grant funding for ÒsánVault Africa.

PROJECT: Compliance-first, blockchain-based real estate tokenization
FOUNDER: Olugbenga Ajayi (Nigeria)
MARKET: Nigeria, Ghana, Kenya, South Africa

ACHIEVEMENTS:
- 7 production-ready Anchor/Rust smart contracts
- 29 passing security tests
- AutoInvest bot suite (5 bots)
- VPS hardening complete

TECHNOLOGY: Solana, React/TypeScript, Node.js API, Pyth Oracle

FUNDING ASK: $10,000 - $50,000

Website: osanvaultafrica.com

Looking forward to applying through your grants program.

Best regards,
Olugbenga Ajayi
Olugbenga1000@gmail.com
+2347065056103`
  });
  console.log('✅ Gitcoin sent to support@gitcoin.co');
}

// Superteam uses portal - send to them
async function sendSuperteam() {
  await transporter.sendMail({
    from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
    to: 'hello@superteam.fun',
    subject: 'Grant Application - ÒsánVault Africa',
    text: `Dear Superteam Nigeria,

Applying for Solana Foundation grant via your portal.

PROJECT: ÒsánVault Africa - Real Estate Tokenization
LOCATION: Nigeria
FOUNDER: Olugbenga Ajayi

We have 7 smart contracts ready on Solana for property tokenization.

Applying via: https://superteam.fun/earn/regions/nigeria/

Best,
Olugbenga
+2347065056103`
  });
  console.log('✅ Superteam sent');
}

sendGitcoin();
sendSuperteam();