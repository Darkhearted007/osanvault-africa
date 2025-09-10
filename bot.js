// ÒsánVault Africa WhatsApp Bot – Base Setup
// Run: node bot.js

const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const fs = require('fs')

// Load or create user DB
const DB_FILE = './users.json'
let users = fs.existsSync(DB_FILE) ? JSON.parse(fs.readFileSync(DB_FILE)) : {}

// Save users
function saveUsers() {
    fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2))
}

// Broadcast message (manual trigger for now)
async function broadcastMessage(sock, message) {
    for (let jid of Object.keys(users)) {
        await sock.sendMessage(jid, { text: message })
    }
    console.log("✅ Broadcast sent to all users")
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info')
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    })

    sock.ev.on('creds.update', saveCreds)

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
            if(shouldReconnect) startBot()
        } else if(connection === 'open') {
            console.log('✅ ÒsánVault Bot connected to WhatsApp!')
        }
    })

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0]
        if (!msg.message || msg.key.fromMe) return

        const jid = msg.key.remoteJid
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ""

        // Add user to DB if not already there
        if (!users[jid]) {
            users[jid] = { joined: new Date().toISOString(), messages: [] }
            saveUsers()
            await sock.sendMessage(jid, { text: "👋 Welcome to ÒsánVault Africa!\n\nYou’re now part of the future of African wealth.\n\n🌍 Expect daily Ifá-coded iwure, investor updates, and tokenized real estate insights.\n\nReply with *wealth* to see how ÒsánVault builds your financial destiny." })
        }

        users[jid].messages.push({ text, time: new Date().toISOString() })
        saveUsers()

        // Basic commands
        if (text.toLowerCase() === "wealth") {
            await sock.sendMessage(jid, { text: "💰 ÒsánVault Wealth Code:\n\n‘The one who plants Òsán, reaps forever.’ 🌿\n\nThrough fractionalized real estate and NET tokens, your wealth multiplies beyond land boundaries.\n\n🚀 You are not just investing in property — you’re investing in legacy." })
        }

        if (text.toLowerCase() === "join") {
            await sock.sendMessage(jid, { text: "✅ You’re officially registered as an ÒsánVault pioneer investor. Stay tuned for updates, opportunities, and iwure drops." })
        }
    })

    // Example: Auto daily broadcast (every 60s for demo, later cron job at 8AM)
    setInterval(async () => {
        const dailyIwure = "🌞 Daily Ifá Wealth Code:\n\n‘Ori ti o gba Òsán, kii kuna.’ — A head that accepts Òsán never fails.\n\nÒsánVault Africa secures your wealth through tokenized properties and ancestral alignment."
        await broadcastMessage(sock, dailyIwure)
    }, 60000) // 1 minute for testing
}

startBot()
