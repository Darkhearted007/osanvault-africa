import PptxGenJS from "pptxgenjs"
import { generatePitchDeck, type DeckConfig } from "./generate"

const KBW_CONFIG: DeckConfig = {
  author: "Olugbenga Ajayi",
  company: "Òsánvault Africa",
  title: "KBW 2026 — Investor Pitch Deck",
  subtitle: "Korea Blockchain Week 2026 | Seoul, South Korea | September 29–October 1",
}

const pptx = generatePitchDeck(KBW_CONFIG)
const outputPath = "osanvault-kbw2026.pptx"

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`Generated: ${outputPath}`)
    console.log("Ready for KBW 2026 investor meetings!")
  })
  .catch(console.error)