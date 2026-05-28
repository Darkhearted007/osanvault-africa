import { Router, type IRouter } from "express";
import { db, carbonProjectsTable } from "@workspace/db";
import { ListCarbonProjectsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/carbon-projects", async (_req, res): Promise<void> => {
  const rows = await db.select().from(carbonProjectsTable).orderBy(carbonProjectsTable.id);
  res.json(ListCarbonProjectsResponse.parse(rows));
});

export default router;
