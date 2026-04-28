import { payoutQueue } from "./queues"
import { users } from "./users"
import { getUserBalance } from "./balance"

export function startScheduler() {
  // TEST MODE: run every 60 seconds (change later to 24h)
  setInterval(async () => {
    console.log("⏰ Running REAL payout cycle")

    for (const user of users) {
      const balance = getUserBalance(user.id)

      if (balance <= 0) continue

      await payoutQueue.add("daily-payout", {
        userId: user.id,
        balance,
        apy: user.apy,
      })

      console.log(`📤 Queued payout for ${user.id}`, balance)
    }
  }, 60 * 1000)
}
