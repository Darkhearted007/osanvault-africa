import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { createInterface } from 'readline';

const CLIENT_ID = '1033665469946-p00j1v9lidnje0abvv5naec9r6jjgpvn.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'http://localhost:3000/oauth2callback';
const TOKEN_DIR = './tokens';

const oAuth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

async function generateAuthUrl() {
  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send', 'https://www.googleapis.com/auth/gmail.readonly'],
    prompt: 'consent'
  });
}

async function getTokenFromCode(code: string) {
  const { tokens } = await oAuth2Client.getToken(code);
  return tokens;
}

async function sendEmail(to: string, subject: string, body: string) {
  oAuth2Client.setCredentials({
    refresh_token: '1//0g' // This needs to be a real token
  });
  
  const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
  
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    '',
    body
  ].join('\n');
  
  const encodedMessage = Buffer.from(message).toString('base64url');
  
  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encodedMessage }
  });
}

// If we have a code from the URL, get token
const args = process.argv.slice(2);
if (args.length > 0 && args[0].startsWith('http')) {
  const url = new URL(args[0]);
  const code = url.searchParams.get('code');
  if (code) {
    getTokenFromCode(code).then(tokens => {
      console.log('Token obtained:', JSON.stringify(tokens, null, 2));
    });
  }
} else {
  // Generate auth URL
  generateAuthUrl().then(url => {
    console.log('\n=== Gmail Authorization ===\n');
    console.log('1. Open this URL in your browser:\n');
    console.log(url);
    console.log('\n2. After logging in, you\'ll be redirected to a blank page');
    console.log('3. Copy the FULL URL from your browser address bar and paste it here\n');
    
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    rl.question('Paste the redirected URL: ', async (redirectUrl) => {
      const urlObj = new URL(redirectUrl);
      const authCode = urlObj.searchParams.get('code');
      
      if (authCode) {
        const tokens = await getTokenFromCode(authCode);
        console.log('\n✅ Token obtained! Save this to use later:');
        console.log(JSON.stringify(tokens, null, 2));
        
        // Now test sending
        console.log('\nTesting email send...');
        try {
          oAuth2Client.setCredentials(tokens);
          const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
          
          const testMsg = 'To: olugbenga.ajayi@osanvault.africa\nSubject: Test from ÒsánVault\n\nEmail system working!';
          await gmail.users.messages.send({
            userId: 'me',
            requestBody: { raw: Buffer.from(testMsg).toString('base64url') }
          });
          console.log('✅ Email sent successfully!');
        } catch (e) {
          console.error('Send failed:', e);
        }
      }
      rl.close();
    });
  });
}