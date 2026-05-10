import { Router } from 'express'
import nodemailer from 'nodemailer'

const router = Router()

const SUPPORT_CONFIG = {
  email: 'Olugbenga1000@gmail.com',
  phone: '+2347065056103',
  telegram: '@OsanvaultAfrica',
  website: 'https://osanvaultafrica.com'
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'Olugbenga1000@gmail.com',
    pass: 'daefebttmynvkztr'
  }
})

router.get('/contact-info', (_req, res) => {
  res.json({
    success: true,
    data: {
      email: SUPPORT_CONFIG.email,
      phone: SUPPORT_CONFIG.phone,
      telegram: SUPPORT_CONFIG.telegram,
      website: SUPPORT_CONFIG.website,
      hours: 'Mon-Fri 9AM-6PM WAT'
    }
  })
})

router.post('/contact', async (req, res) => {
  const { name, email, subject, message, type = 'general' } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Name, email, and message are required'
    })
  }

  const SUPPORT_TAGS: Record<string, string> = {
    investment: '💰 Investment Inquiry',
    technical: '🔧 Technical Support',
    partnership: '🤝 Partnership',
    general: '📧 General Inquiry'
  }

  try {
    await transporter.sendMail({
      from: `"ÒsánVault Contact" <Olugbenga1000@gmail.com>`,
      to: SUPPORT_CONFIG.email,
      subject: `[${SUPPORT_TAGS[type] || 'Contact'}] ${subject || 'New Contact Form Submission'}`,
      text: `
Name: ${name}
Email: ${email}
Type: ${type}
Subject: ${subject || 'N/A'}

Message:
${message}
      `,
      html: `
<h3>New Contact Form Submission</h3>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Type:</strong> ${type}</p>
<p><strong>Subject:</strong> ${subject || 'N/A'}</p>
<hr>
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br>')}</p>
      `
    })

    // Send auto-reply to user
    await transporter.sendMail({
      from: '"ÒsánVault Africa" <Olugbenga1000@gmail.com>',
      to: email,
      subject: 'We received your message - ÒsánVault Africa',
      text: `
Dear ${name},

Thank you for contacting ÒsánVault Africa!

We have received your message and our team will get back to you within 24-48 hours.

If this is urgent, please call us at ${SUPPORT_CONFIG.phone}.

Best regards,
ÒsánVault Africa Team
      `
    })

    res.json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!'
    })
  } catch (error: unknown) {
    console.error('Contact form error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again or contact us directly.'
    })
  }
})

router.post('/report-issue', async (req, res) => {
  const { wallet, issue, severity = 'medium' } = req.body

  if (!wallet || !issue) {
    return res.status(400).json({
      success: false,
      error: 'Wallet address and issue description are required'
    })
  }

  try {
    await transporter.sendMail({
      from: '"ÒsánVault System" <Olugbenga1000@gmail.com>',
      to: SUPPORT_CONFIG.email,
      subject: `[URGENT] Issue Report - ${severity.toUpperCase()}`,
      text: `
ISSUE REPORT

Wallet: ${wallet}
Severity: ${severity}

Issue:
${issue}

Reported at: ${new Date().toISOString()}
      `
    })

    res.json({
      success: true,
      message: 'Issue reported. Our team will investigate.'
    })
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: 'Failed to report issue' })
  }
})

export default router
export { SUPPORT_CONFIG }