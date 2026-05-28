import { Router, type IRouter } from "express";
import { desc } from "drizzle-orm";
import { db, activityEventsTable } from "@workspace/db";
import { ListActivityQueryParams, ListActivityResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/activity", async (req, res): Promise<void> => {
  const query = ListActivityQueryParams.safeParse(req.query);
  const limit = query.success ? (query.data.limit ?? 20) : 20;

  const rows = await db
    .select()
    .from(activityEventsTable)
    .orderBy(desc(activityEventsTable.timestamp))
    .limit(limit);

  res.json(ListActivityResponse.parse(rows));
});

export default router;
