export function calculateYield(params: {
  principal: number
  baseApy: number
  liquidityFactor: number
  riskWeight: number
  daysActive: number
}) {
  const timeFactor = 1 / (1 + params.daysActive)

  return (
    params.principal *
    params.baseApy *
    params.liquidityFactor *
    params.riskWeight *
    timeFactor
  )
}
