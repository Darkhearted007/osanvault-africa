import { pool } from "../db/index.js";
import crypto from "crypto";

export type LedgerEntry = {
  userId: string;
  type: "CREDIT" | "DEBIT";
  token: string;
  amount: number;
  reason: string;
  timestamp: number;
};

async function getLastHash(): Promise<string | null> {
  const res = await pool.query(
    "SELECT hash FROM ledger ORDER BY id DESC LIMIT 1"
  );
  return res.rows[0]?.hash || null;
}

function createHash(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

export async function addLedger(entry: LedgerEntry) {
  const prevHash = await getLastHash();

  const payload = JSON.stringify({ ...entry, prevHash });
  const hash = createHash(payload);

  await pool.query(
    `
    INSERT INTO ledger (
      user_id,
      type,
      token,
      amount,
      reason,
      timestamp,
      prev_hash,
      hash
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    `,
    [
      entry.userId,
      entry.type,
      entry.token,
      entry.amount,
      entry.reason,
      entry.timestamp,
      prevHash,
      hash
    ]
  );

  return hash;
}
