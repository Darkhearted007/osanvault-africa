import { Router, type IRouter } from "express";
import { eq, desc, count } from "drizzle-orm";
import { z } from "zod";
import { db, leadsTable, insertLeadSchema } from "@workspace/db";

const router: IRouter = Router();

function generateRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let ref = "OSV-";
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

const UpdateLeadSchema = z.object({
  status:       z.enum(["new", "contacted", "qualified", "converted", "unqualified"]).optional(),
  investorType: z.string().optional(),
  message:      z.string().optional(),
});

router.get("/leads/count", async (_req, res): Promise<void> => {
  const [row] = await db.select({ value: count() }).from(leadsTable);
  res.json({ count: Number(row?.value ?? 0) });
});

router.get("/leads", async (req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(leadsTable)
    .orderBy(desc(leadsTable.createdAt));
  res.json(rows);
});

router.get("/leads/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.select().from(leadsTable).where(eq(leadsTable.id, id));
  if (!row) { res.status(404).json({ error: "Lead not found" }); return; }
  res.json(row);
});

router.post("/leads", async (req, res): Promise<void> => {
  const parsed = insertLeadSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid submission", details: parsed.error.message });
    return;
  }
  const existing = await db
    .select({ id: leadsTable.id })
    .from(leadsTable)
    .where(eq(leadsTable.email, parsed.data.email.toLowerCase().trim()));
  if (existing.length > 0) {
    res.status(409).json({ error: "Email already registered", alreadyExists: true });
    return;
  }
  const [row] = await db
    .insert(leadsTable)
    .values({
      ...parsed.data,
      email: parsed.data.email.toLowerCase().trim(),
      referenceCode: generateRef(),
      updatedAt: new Date(),
    })
    .returning();
  res.status(201).json(row);
});

router.patch("/leads/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const parsed = UpdateLeadSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  const [row] = await db
    .update(leadsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(leadsTable.id, id))
    .returning();
  if (!row) { res.status(404).json({ error: "Lead not found" }); return; }
  res.json(row);
});

router.delete("/leads/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid id" }); return; }
  const [row] = await db.delete(leadsTable).where(eq(leadsTable.id, id)).returning();
  if (!row) { res.status(404).json({ error: "Lead not found" }); return; }
  res.status(204).send();
});

export default router;
