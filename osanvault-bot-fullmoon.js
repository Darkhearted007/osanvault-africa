/**
 * ÒsánVault Africa WhatsApp Bot — Full Moon Edition (Modular Single File)
 * Number: 0904 941 8430
 * Purpose: Complete investor growth engine with segmentation, dynamic iwure engine,
 * referral tracking, gamified wealth tracking, wallet-check hooks, Google Sheets hooks,
 * AI-style smart replies (rule-based + placeholder for LLM), and broadcast scheduler.
 *
 * NOTE: This file is intentionally modular (separated by sections) but remains a single
 * deployable script for ease of copying into Termux / VPS. For production, split into modules.
 *
 * Dependencies:
 *  - @adiwajshing/baileys
 *  - node-schedule
 *  - axios
 *  - csv-stringify
 *  - fs-extra
 *
 * Run:
 *  npm install @adiwajshing/baileys node-schedule axios csv-stringify fs-extra
 *  node osanvault-bot-fullmoon.js
 */

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const schedule = require('node-schedule');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const fs = require('fs-extra');
const { stringify } = require('csv-stringify/sync');

// ======= CONFIG & FILES =======
const BOT_NAME = 'ÒsánVault Africa'
const BOT_NUMBER = '09049418430'
const PITCH_DECK_LINK = 'https://osanvault.africa/deck.pdf'
const TELEGRAM_LINK = 'https://t.me/OsanVaultAfrica'
const WEBSITE = 'https://osanvault.africa'

const DATA_DIR = './data'
const LEADS_CSV = `${DATA_DIR}/leads.csv`
const SUBSCRIBERS_JSON = `${DATA_DIR}/subscribers.json`
const USERS_JSON = `${DATA_DIR}/users.json` // stores profiles, tags, refs, balances

fs.ensureDirSync(DATA_DIR)

// init files
if (!fs.existsSync(LEADS_CSV)) fs.writeFileSync(LEADS_CSV, stringify([['timestamp','jid','name','message','action','referrer']]) + '\n')
if (!fs.existsSync(SUBSCRIBERS_JSON)) fs.writeFileSync(SUBSCRIBERS_JSON, JSON.stringify([], null, 2))
if (!fs.existsSync(USERS_JSON)) fs.writeFileSync(USERS_JSON, JSON.stringify({}, null, 2))

// ======= DYNAMIC CONTENT ENGINES =======
// 30 rotating iwure — monthly cycle
const iwureEngine = (() => {
  const iwure = []
  for (let i=1;i<=30;i++) {
    iwure.push(`Àṣẹ ${i}: May your investment be held by ancestors and multiply with honour. (${i})`)
  }
  return {
    getForDay: (d = new Date()) => {
      // day of month -> pick iwure index
      const idx = (d.getDate() - 1) % iwure.length
      return iwure[idx]
    }
  }
})()

// Rotating narratives (longer bank of narratives)
const narratives = [
  "ÒsánVault tokenizes land & minerals so everyday Africans can own real wealth.",
  "NET Token holders share in rental yield, mineral royalties, and platform governance.",
  "We fuse Solana speed with community governance and ancestral Ifá alignment.",
  "Invest small, own big — fractional ownership democratizes real estate.",
  "Your NET Tokens are receipts of real assets held in verified custodial vaults.",
  "Liquidity + Yield: trade fractions or hold for steady cashflows from rents & royalties.",
  "We prioritize transparency: on-chain records + off-chain audits for all listings.",
  "Early investors get priority allocations and private investor briefings.",
  "ÒsánVault bridges legacy wealth and modern DeFi for Africa-first prosperity.",
]

const lessons = [
  'Tokenization breaks expensive assets into affordable digital shares.',
  'NET Token represents fractional legal/beneficial ownership in tokenized properties or minerals.',
  'Solana provides low fees + high throughput ideal for microtransactions.',
  'Staking and vault yields are generated from real rental income and mineral offtake agreements.',
  'Diversify: hold NET Token across property types and mineral vaults to stabilize returns.'
]

// ======= USER & CRM HELPERS =======
function loadUsers(){ return JSON.parse(fs.readFileSync(USERS_JSON)) }
function saveUsers(u){ fs.writeFileSync(USERS_JSON, JSON.stringify(u, null, 2)) }

function ensureUser(jid){
  const users = loadUsers()
  if (!users[jid]) {
    users[jid] = { jid, tags: ['casual'], name: '', email: '', referrals: [], referredBy: '', netBalance: 0, milestone: 0 }
    saveUsers(users)
  }
  return users[jid]
}

function tagUser(jid, tag){
  const users = loadUsers(); ensureUser(jid);
  if (!users[jid].tags.includes(tag)) users[jid].tags.push(tag)
  saveUsers(users)
}

function setUserEmail(jid, name, email){
  const users = loadUsers(); ensureUser(jid);
  users[jid].name = name || users[jid].name
  users[jid].email = email || users[jid].email
  // upgrade tag
  if (!users[jid].tags.includes('interested')) users[jid].tags.push('interested')
  saveUsers(users)
}

function addReferral(jid, targetNumber){
  const users = loadUsers(); ensureUser(jid);
  users[jid].referrals.push(targetNumber)
  saveUsers(users)
}

function creditNet(jid, amount){
  const users = loadUsers(); ensureUser(jid);
  users[jid].netBalance = (users[jid].netBalance || 0) + amount
  saveUsers(users)
}

// Log leads
function logLead({jid, name='', message='', action='inbound', referrer=''}){
  const row = [new Date().toISOString(), jid, name, message, action, referrer]
  fs.appendFileSync(LEADS_CSV, stringify([row]) + '\n')
}

// ======= BROADCAST HELPERS =======
function getAllSubscribers(){
  return JSON.parse(fs.readFileSync(SUBSCRIBERS_JSON))
}
function addSubscriber(jid){
  const subs = getAllSubscribers()
  if (!subs.includes(jid)) { subs.push(jid); fs.writeFileSync(SUBSCRIBERS_JSON, JSON.stringify(subs, null, 2)) }
}
function removeSubscriber(jid){
  let subs = getAllSubscribers(); subs = subs.filter(s => s !== jid); fs.writeFileSync(SUBSCRIBERS_JSON, JSON.stringify(subs, null, 2))
}

// ======= REFERRAL CODE GENERATION =======
function referralCodeFor(jid){
  // e.g., OSAN-09049418430-5f2
  return `OSAN-${jid.split('@')[0].replace(/[^0-9]/g,'')}-${Math.random().toString(36).slice(2,6).toUpperCase()}`
}

// ======= WALLET CHECK (placeholder) =======
async function getSolanaBalance(address){
  // Placeholder: in production, call a Solana API or indexer (e.g., public RPC or Solana Beach API)
  // Here we fake a response for demonstration
  return { sol: 1.234, tokens: { NET: 150 } }
}

// ======= SMART REPLIES (rule-based with LLM hook point) =======
async function smartReply(jid, text){
  const lc = (text||'').toLowerCase()
  if (lc.includes('why invest') || lc.includes('why should i invest')){
    return `${BOT_NAME} unites tokenized land & minerals on Solana to deliver real yields, transparency, and fractional ownership — built for African investors looking for generational wealth. See our pitch: ${PITCH_DECK_LINK}`
  }
  if (lc.includes('how to buy') || lc.includes('buy net')){
    return `To buy NET Token: 1) Create a Solana wallet (Phantom/Solflare). 2) Fund it with SOL. 3) Swap for NET via the provided DEX or OTC portal. Need step-by-step? Reply 'wallet help'` 
  }
  // default fallback
  return null
}

// ======= MAIN BOT FLOW =======
async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState('auth')
  const sock = makeWASocket({ auth: state, printQRInTerminal: false })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
    if (qr) { console.log('\nScan QR for WhatsApp (0904 941 8430):'); qrcode.generate(qr, { small: true }) }
    if (connection === 'close'){
      const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
      else console.log('Logged out — remove auth and re-run')
    }
    if (connection === 'open') console.log(`${BOT_NAME} connected`)
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('messages.upsert', async (m) => {
    try{
      const msg = m.messages[0]
      if (!msg.message || msg.key.remoteJid === 'status@broadcast') return
      const jid = msg.key.remoteJid
      const name = msg.pushName || ''
      const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim()

      ensureUser(jid)
      logLead({ jid, name, message: text, action: 'inbound' })

      // Keywords and menu
      const lc = text.toLowerCase()
      if (['hi','hello','hey'].includes(lc)){
        const welcome = `👋 Welcome to ${BOT_NAME}!\nOwn a piece of Nigeria, one piece at a time.\n\nReply with:\n1️⃣ Pitch Deck\n2️⃣ How to Invest\n3️⃣ Join Community\n4️⃣ Airdrop Info\n5️⃣ Subscribe (daily insights)\n6️⃣ My Profile / Wealth\nType a question any time and I'll respond.`
        await sock.sendMessage(jid, { text: welcome })
        return
      }

      if (lc === '1' || lc.includes('pitch')){ await sock.sendMessage(jid, { text: `📄 Pitch Deck: ${PITCH_DECK_LINK}` }); return }
      if (lc === '2' || lc.includes('invest')){ await sock.sendMessage(jid, { text: `💰 How to Invest:\n1) Create Solana Wallet.\n2) Acquire NET Token.\n3) Stake or invest via ${WEBSITE}.\nReply 'wallet help' for guidance.` }); tagUser(jid,'interested'); return }
      if (lc === '3' || lc.includes('community')){ await sock.sendMessage(jid, { text: `🔗 Join: ${TELEGRAM_LINK}` }); return }
      if (lc === '4' || lc.includes('airdrop')){ await sock.sendMessage(jid, { text: `🎁 Airdrop: Reply 'referral' to get your code.`}); return }

      if (lc === 'subscribe'){ addSubscriber(jid); await sock.sendMessage(jid, { text: `✅ Subscribed to daily insights & iwure.`}); return }

      if (lc.startsWith('name:') && lc.includes('email:')){
        // Parse: Name: John Doe email: john@x.com
        const parts = text.split(/email:/i)
        const namePart = parts[0].replace(/name:/i,'').trim()
        const emailPart = parts[1].trim()
        setUserEmail(jid, namePart, emailPart)
        await sock.sendMessage(jid, { text: `Thanks ${namePart}. You're added to our investor list. Expect exclusive updates.` })
        addSubscriber(jid)
        return
      }

      if (lc === 'referral'){
        const code = referralCodeFor(jid)
        addReferral(jid, code)
        await sock.sendMessage(jid, { text: `🔗 Your referral code: ${code}. Share it — when friends sign up you earn NET rewards.` })
        return
      }

      if (lc === 'my profile' || lc === 'profile' || lc === 'wealth'){
        const users = loadUsers(); const u = users[jid]
        const reply = `📊 Profile:\nName: ${u.name || '—'}\nEmail: ${u.email || '—'}\nTags: ${u.tags.join(', ')}\nReferrals: ${u.referrals.length}\nNET Balance (tracked): ${u.netBalance}\n\nReply 'wallet <address>' to check on-chain balance.`
        await sock.sendMessage(jid, { text: reply })
        return
      }

      if (lc.startsWith('wallet ')){
        const addr = text.split(' ')[1]
        const bal = await getSolanaBalance(addr)
        await sock.sendMessage(jid, { text: `🔎 Wallet ${addr} summary:\nSOL: ${bal.sol}\nNET tokens: ${bal.tokens.NET || 0}` })
        tagUser(jid,'serious')
        return
      }

      if (lc.includes('wallet help')){
        await sock.sendMessage(jid, { text: `🔰 Wallet Help:\n1) Install Phantom or Solflare.\n2) Create wallet and save seed phrase offline.\n3) Share your public Solana address to receive NET.` })
        return
      }

      // Smart reply fallback
      const sr = await smartReply(jid, text)
      if (sr) { await sock.sendMessage(jid, { text: sr }); return }

      // final fallback
      await sock.sendMessage(jid, { text: `Sorry, I didn't understand. Reply 'hi' to see options or ask a question like 'how to invest'` })

    }catch(err){ console.error('message handler error', err) }
  })

  // Schedulers: daily & weekly
  schedule.scheduleJob('0 8 * * *', async () => { // daily 8AM server time
    const subs = getAllSubscribers()
    const today = new Date()
    const iwure = iwureEngine.getForDay(today)
    const narrative = narratives[today.getDate() % narratives.length]
    const lesson = lessons[today.getDate() % lessons.length]

    const broadcast = `🌞 Good Morning Investment Circle!\n\n${iwure}\n\n${narrative}\n\nQuick Lesson: ${lesson}\n\n${WEBSITE} | ${TELEGRAM_LINK}`
    for (let jid of subs){ try{ await sock.sendMessage(jid, { text: broadcast }) } catch(e){ console.error('broadcast fail', jid, e) }}
  })

  // Weekly Sunday newsletter (Sunday 18:00)
  schedule.scheduleJob('0 18 * * 0', async () => {
    const subs = getAllSubscribers()
    const message = `📢 ÒsánVault Weekly Wealth Letter\n\nThis week: platform updates, new listings, investor spotlight, and an Ifá blessing for prosperity.\n\nExplore: ${WEBSITE}`
    for (let jid of subs){ try{ await sock.sendMessage(jid, { text: message }) } catch(e){ console.error('weekly broadcast fail', jid) }}
  })

}

startBot().catch(e=>console.error('startup failed', e))

