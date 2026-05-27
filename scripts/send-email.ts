import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD;

if (!EMAIL_USER || !EMAIL_APP_PASSWORD) {
  console.error('ERROR: EMAIL_USER and EMAIL_APP_PASSWORD environment variables are required.');
  console.error('Set them in your .env file or environment.');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: EMAIL_USER, pass: EMAIL_APP_PASSWORD }
});

async function sendEmail(to: string, subject: string, body: string) {
  try {
    const info = await transporter.sendMail({
      from: `"ÒsánVault Africa" <${EMAIL_USER}>`,
      to,
      subject,
      text: body,
      html: `<p>${body.replace(/\n/g, '<br>')}</p>`
    });
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email error:', error);
    throw error;
  }
}

// Test send
sendEmail(
  'olugbenga.ajayi@osanvault.africa',
  'ÒsánVault Email System Test',
  `Hello Olugbenga,

This is a test email from the ÒsánVault Africa platform.

The email system is now working! We can now:
- Send grant applications
- Notify investors
- Handle support emails

Best regards,
ÒsánVault System`
).then(() => {
  console.log('\n✅ SUCCESS - Email delivered!');
  process.exit(0);
}).catch((e) => {
  console.error('\n❌ FAILED:', e.message);
  process.exit(1);
});