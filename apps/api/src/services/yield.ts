export function calculateDailyYield(balance: number, apy: number) {
  return (balance * apy) / 100 / 365
}
