import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, propertiesTable } from "@workspace/db";
import {
  ListPropertiesResponse,
  GetPropertyParams,
  GetPropertyResponse,
  UpdatePropertyFundingBody,
} from "@workspace/api-zod";
import { sendPushToAll } from "../services/notifications.js";

const router: IRouter = Router();

router.get("/properties", async (req, res): Promise<void> => {
  const rows = await db.select().from(propertiesTable).orderBy(propertiesTable.id);
  res.json(ListPropertiesResponse.parse(rows));
});

router.get("/properties/:id", async (req, res): Promise<void> => {
  const params = GetPropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  res.json(GetPropertyResponse.parse(row));
});

router.patch("/properties/:id/funding", async (req, res): Promise<void> => {
  const params = GetPropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdatePropertyFundingBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [before] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, params.data.id));

  if (!before) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const [updated] = await db
    .update(propertiesTable)
    .set({ raised: body.data.raised })
    .where(eq(propertiesTable.id, params.data.id))
    .returning();

  const wasFullyFunded =
    before.raised < before.targetRaise &&
    updated.raised >= updated.targetRaise;

  if (wasFullyFunded) {
    sendPushToAll({
      title: "Property Fully Funded!",
      body: `${updated.name} has reached 100% funding.`,
      data: {
        screen: "property",
        propertyId: updated.id,
        deepLink: `osanvault-mobile://property/${updated.id}`,
      },
    }).catch(() => {});
  }

  res.json(GetPropertyResponse.parse(updated));
});

export default router;
