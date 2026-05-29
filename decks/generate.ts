import PptxGenJS from "pptxgenjs"

export const PLATFORM_NAME = "Òsánvault Africa"
export const TAGLINE = "Fractional Real Estate Investment for Africa"
export const FOUNDER = "Olugbenga Ajayi"
export const WEBSITE = "https://osanvault.africa"

export type DeckConfig = {
  author: string
  company: string
  title: string
  subtitle?: string
}

export interface SlideData {
  title: string
  subtitle?: string
  bullets: string[]
  notes?: string
}

const BRAND = {
  primary: "1A1A2E",
  accent: "E8B059",
  dark: "0D0D1A",
  text: "E8E8F0",
  muted: "8888A0",
  bg: "0A0A1A",
  cardBg: "1A1A2E",
}

function makeDeck(config: DeckConfig) {
  const pptx = new PptxGenJS()

  pptx.author = config.author
  pptx.title = `${config.title} — ${config.company}`
  pptx.subject = "Investor Pitch Deck"
  pptx.company = config.company
  pptx.revision = "1"
  pptx.baseUrl = PLATFORM_NAME

  pptx.layout = "LAYOUT_16x9"
  pptx.defineLayout({ name: "CUSTOM", width: 13.33, height: 7.5 })
  pptx.layout = "CUSTOM"

  pptx.author = config.author
  pptx.title = config.title

  pptx.theme = {
    primary: BRAND.primary,
    accent: BRAND.accent,
    text: BRAND.text,
  }

  return pptx
}

function addTitleSlide(pptx: InstanceType<typeof PptxGenJS>, config: DeckConfig) {
  const slide = pptx.addSlide()
  slide.background = { color: BRAND.bg }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 7.5,
    fill: { color: BRAND.bg },
    line: { color: BRAND.bg },
  })

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 5.8, w: 13.33, h: 1.7,
    fill: { color: BRAND.accent },
    line: { color: BRAND.accent },
  })

  slide.addText(PLATFORM_NAME, {
    x: 0.5, y: 1.5, w: 12.33, h: 1.2,
    fontSize: 54, bold: true, color: BRAND.accent, align: "center",
    fontFace: "Georgia",
  })

  slide.addText(config.title, {
    x: 0.5, y: 2.8, w: 12.33, h: 0.8,
    fontSize: 36, color: BRAND.text, align: "center",
    fontFace: "Arial",
  })

  if (config.subtitle) {
    slide.addText(config.subtitle, {
      x: 0.5, y: 3.6, w: 12.33, h: 0.5,
      fontSize: 20, color: BRAND.muted, align: "center",
    })
  }

  slide.addText(`${FOUNDER}\n${WEBSITE}`, {
    x: 0.5, y: 5.95, w: 12.33, h: 1,
    fontSize: 18, color: BRAND.dark, align: "center", bold: true,
  })

  return slide
}

function addContentSlide(pptx: InstanceType<typeof PptxGenJS>, data: SlideData) {
  const slide = pptx.addSlide()
  slide.background = { color: BRAND.bg }

  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 13.33, h: 1.2,
    fill: { color: BRAND.cardBg },
    line: { color: BRAND.cardBg },
  })

  slide.addText(data.title, {
    x: 0.5, y: 0.3, w: 12.33, h: 0.7,
    fontSize: 28, bold: true, color: BRAND.accent,
  })

  const bulletItems = data.bullets.map((b, i) => ({
    text: b,
    options: {
      bullet: { type: "bullet", color: BRAND.accent },
      breakLine: i < data.bullets.length - 1,
      indentLevel: 0,
    },
  }))

  slide.addText(bulletItems, {
    x: 0.7, y: 1.5, w: 11.93, h: 5.2,
    fontSize: 18, color: BRAND.text, valign: "top",
    paraSpaceAfter: 12,
  })

  if (data.notes) {
    slide.addNotes(data.notes)
  }

  return slide
}

function addStatSlide(pptx: InstanceType<typeof PptxGenJS>, stats: Array<{ value: string; label: string }>) {
  const slide = pptx.addSlide()
  slide.background = { color: BRAND.bg }

  slide.addText("By The Numbers", {
    x: 0.5, y: 0.4, w: 12.33, h: 0.7,
    fontSize: 28, bold: true, color: BRAND.accent, align: "center",
  })

  const cols = stats.length
  const cardW = 11.33 / cols

  stats.forEach((stat, i) => {
    const x = 1 + i * cardW

    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.5, w: cardW - 0.2, h: 4,
      fill: { color: BRAND.cardBg },
      line: { color: BRAND.accent, width: 2 },
    })

    slide.addText(stat.value, {
      x, y: 2, w: cardW - 0.2, h: 1.5,
      fontSize: 40, bold: true, color: BRAND.accent, align: "center",
    })

    slide.addText(stat.label, {
      x, y: 3.5, w: cardW - 0.2, h: 1.5,
      fontSize: 16, color: BRAND.text, align: "center",
    })
  })

  return slide
}

export function generatePitchDeck(config: DeckConfig) {
  const pptx = makeDeck(config)

  addTitleSlide(pptx, config)

  addContentSlide(pptx, {
    title: "The Problem",
    bullets: [
      "African real estate requires $50K–$500K minimum entry",
      "Traditional property investment excludes 95%+ of Africans",
      "No transparent, fractional ownership on-chain",
      "Dividend distribution is manual, opaque, and slow",
      "Regulatory pathways unclear for digital asset property investments",
    ],
  })

  addContentSlide(pptx, {
    title: "Our Solution — Òsánvault Africa",
    bullets: [
      `Fractional ownership starting from $${10} USD equivalent`,
      "On-chain dividend distribution, transparent and automatic",
      `500M OSANV utility token on Solana`,
      "Nigeria SEC ARIP Sandbox — compliance-first architecture",
      "Pan-African markets: Nigeria, Ghana, Kenya, South Africa",
    ],
  })

  addStatSlide(pptx, [
    { value: "$10", label: "Minimum Investment" },
    { value: "500M", label: "OSANV Token Supply" },
    { value: "4", label: "Target Markets" },
    { value: "0.5%", label: "Annual Management Fee" },
  ])

  addContentSlide(pptx, {
    title: "Revenue Model",
    bullets: [
      "Platform fees: 1.5% per transaction",
      "AUM management: 0.5% annually",
      "Secondary market: 0.3% per trade",
      "Property onboarding: fixed per listing",
      "Total addressable market: pan-African real estate",
    ],
  })

  addContentSlide(pptx, {
    title: "Go-to-Market & Growth",
    bullets: [
      "Phase 1: Nigeria SEC ARIP Sandbox entry",
      "Phase 2: Ghana, Kenya, South Africa expansion",
      "Target: $10M AUM within 18 months",
      "Grant targets: Superteam Nigeria, Gitcoin, AfDB",
      "Conference: Korea Blockchain Week 2026 (KBW 2026)",
    ],
  })

  addContentSlide(pptx, {
    title: "Security & Compliance",
    bullets: [
      "RBAC on all smart contracts and API routes",
      "Pyth Network + Switchboard oracle (dual-source)",
      "Gnosis Safe 3-of-5 multisig treasury",
      "SCUML registration pathway",
      "Nigeria SEC ARIP Sandbox compliance",
    ],
  })

  addContentSlide(pptx, {
    title: "Investment Ask",
    bullets: [
      "Pre-seed round target: $250K–$500K",
      "Use of funds: 40% engineering, 30% compliance, 30% growth",
      "Key milestones: SEC sandbox entry, 1,000 investors, $1M AUM",
      `Contact: ${WEBSITE}`,
    ],
  })

  return pptx
}

export async function buildDeck(config: DeckConfig, outputPath: string) {
  const pptx = generatePitchDeck(config)
  await pptx.writeFile({ fileName: outputPath })
  return outputPath
}