export function liquidityFactor(available: number, liabilities: number) {
  if (liabilities === 0) return 1

  const ratio = available / liabilities

  return Math.max(0.3, Math.min(1, ratio))
}
