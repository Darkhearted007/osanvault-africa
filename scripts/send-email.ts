import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
});

async function sendEmail(to: string, subject: string, body: string) {
  try {
    const info = await transporter.sendMail({
      from: '"ÒsánVault Africa" <olugbenga.ajayi@osanvault.africa>',
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