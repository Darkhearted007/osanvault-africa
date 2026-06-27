import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db, whitelistTable, insertWhitelistSchema } from "@workspace/db";

const router: IRouter = Router();

const UpdateWhitelistSchema = z.object({
  status: z.enum(["pending", "approved", "rejected", "revoked"]).optional(),
  kycLevel: z.enum(["basic", "advanced", "institutional"]).optional(),
  investorType: z.enum(["individual", "hni", "institutional", "fund"]).optional(),
  jurisdiction: z.string().optional(),
  investmentCapNgn: z.number().min(0).optional(),
  notes: z.string().optional(),
});

router.get("/whitelist", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(whitelistTable)
    .orderBy(desc(whitelistTable.createdAt));
  res.json(rows);
});

router.get("/whitelist/stats", async (req, res): Promise<void> => {
  const rows = await db.select().from(whitelistTable);
  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
    revoked: rows.filter((r) => r.status === "revoked").length,
    institutional: rows.filter((r) => r.kycLevel === "institutional").length,
  };
  res.json(stats);
});

router.get("/whitelist/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .select()
    .from(whitelistTable)
    .where(eq(whitelistTable.id, id));
  if (!row) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(row);
});

router.post("/whitelist", async (req, res): Promise<void> => {
  const parsed = insertWhitelistSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const existing = await db
    .select()
    .from(whitelistTable)
    .where(eq(whitelistTable.address, parsed.data.address));
  if (existing.length > 0) {
    res.status(409).json({ error: "Address already on whitelist" });
    return;
  }
  const [row] = await db
    .insert(whitelistTable)
    .values({ ...parsed.data, updatedAt: new Date() })
    .returning();
  res.status(201).json(row);
});

router.patch("/whitelist/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const parsed = UpdateWhitelistSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [row] = await db
    .update(whitelistTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(whitelistTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.json(row);
});

router.delete("/whitelist/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid id" });
    return;
  }
  const [row] = await db
    .delete(whitelistTable)
    .where(eq(whitelistTable.id, id))
    .returning();
  if (!row) {
    res.status(404).json({ error: "Entry not found" });
    return;
  }
  res.status(204).send();
});

export default router;
