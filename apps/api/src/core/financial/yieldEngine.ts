import { YieldInput } from "./types"

export function calculateYield(input: YieldInput) {
  const timeDecay = 1 / (1 + input.daysActive)

  const rawYield =
    input.principal *
    input.baseApy *
    input.liquidityFactor *
    input.riskWeight *
    timeDecay

  const adjustedYield =
    rawYield * Math.max(0.3, 1 - input.treasuryStressFactor)

  return adjustedYield
}
