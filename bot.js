const cron = require('node-cron');
const bannerPath = '/root/osanvault-africa/assets/banner.png';
const caption = `🏗 Welcome to ÒsánVault Africa!

📌 We are building Africa’s Web3 Real Estate & Mineral Tokenization platform.
💻 Follow us on Facebook: ${FACEBOOK_LINK}
✅ Registration coming soon!
💎 Use your referral link to earn points!`;

// Schedule daily post at 10:00 AM UTC
cron.schedule('0 10 * * *', () => {
  db.all("SELECT chat_id FROM chats", [], (err, rows) => {
    if (err) return console.error(err);
    rows.forEach(c => {
      bot.sendPhoto(c.chat_id, bannerPath, { caption });
      console.log(`📤 Posted banner to chat ID: ${c.chat_id}`);
    });
  });
});
