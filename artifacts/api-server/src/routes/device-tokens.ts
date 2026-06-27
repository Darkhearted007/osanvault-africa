import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, devicePushTokensTable } from "@workspace/db";
import { RegisterDeviceTokenBody, RegisterDeviceTokenResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/device-tokens", async (req, res): Promise<void> => {
  const body = RegisterDeviceTokenBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const { token, platform = "unknown" } = body.data;

  const existing = await db
    .select()
    .from(devicePushTokensTable)
    .where(eq(devicePushTokensTable.token, token));

  if (existing.length > 0) {
    res.json(RegisterDeviceTokenResponse.parse(existing[0]));
    return;
  }

  const [inserted] = await db
    .insert(devicePushTokensTable)
    .values({ token, platform })
    .returning();

  res.status(201).json(RegisterDeviceTokenResponse.parse(inserted));
});

router.delete("/device-tokens/:token", async (req, res): Promise<void> => {
  const { token } = req.params;
  await db
    .delete(devicePushTokensTable)
    .where(eq(devicePushTokensTable.token, token));
  res.status(204).send();
});

export default router;
