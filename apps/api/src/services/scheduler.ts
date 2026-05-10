import { payoutQueue } from "./queue.js";

const users = [
  { id: "user1", apy: 12 },
  { id: "user2", apy: 10 }
];

export function startScheduler() {
  setInterval(async () => {
    console.log("⏰ Running payout cycle");

    for (const user of users) {
      await payoutQueue.add("daily-payout", {
        userId: user.id,
        balance: 1000,
        apy: user.apy
      });
    }
  }, 60 * 1000);
}
