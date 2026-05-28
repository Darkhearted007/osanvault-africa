import { Router, type IRouter } from "express";
import { db, governanceProposalsTable } from "@workspace/db";
import { ListGovernanceProposalsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/governance-proposals", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(governanceProposalsTable)
    .orderBy(governanceProposalsTable.id);
  res.json(ListGovernanceProposalsResponse.parse(rows));
});

export default router;
