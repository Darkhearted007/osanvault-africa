let totalLiquidity = 0
let totalLiabilities = 0

export function updateTreasury(liquidity: number, liabilities: number) {
  totalLiquidity = liquidity
  totalLiabilities = liabilities
}

export function getLiquidityRatio() {
  if (totalLiabilities === 0) return 1
  return totalLiquidity / totalLiabilities
}

export function getStressFactor() {
  const ratio = getLiquidityRatio()

  if (ratio >= 1.5) return 0
  if (ratio >= 1.2) return 0.1
  if (ratio >= 1.0) return 0.2
  if (ratio >= 0.8) return 0.4

  return 0.7
}
