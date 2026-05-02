import { payoutQueue } from "./queue.js";
import { getUserBalance } from "./balance.js";

const users = [
  { id: "user1", apy: 12 },
  { id: "user2", apy: 10 }
];

export function startScheduler() {
  setInterval(async () => {
    console.log("⏰ Running payout cycle");

    for (const user of users) {
      const balance = getUserBalance(user.id);

      if (!balance || balance <= 0) continue;

      await payoutQueue.add("daily-payout", {
        userId: user.id,
        balance,
        apy: user.apy
      });
    }
  }, 60 * 1000);
}
