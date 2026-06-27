import { Router, type IRouter } from "express";
import { db, governanceProposalsTable } from "@workspace/db";
import {
  ListGovernanceProposalsResponse,
  CreateGovernanceProposalBody,
} from "@workspace/api-zod";
import { sendPushToAll } from "../services/notifications.js";

const router: IRouter = Router();

router.get("/governance-proposals", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(governanceProposalsTable)
    .orderBy(governanceProposalsTable.id);
  res.json(ListGovernanceProposalsResponse.parse(rows));
});

router.post("/governance-proposals", async (req, res): Promise<void> => {
  const body = CreateGovernanceProposalBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [inserted] = await db
    .insert(governanceProposalsTable)
    .values({
      title: body.data.title,
      description: body.data.description,
      proposer: body.data.proposer,
      status: body.data.status,
      quorum: body.data.quorum,
      endTime: body.data.endTime,
      category: body.data.category,
    })
    .returning();

  if (inserted.status === "active") {
    sendPushToAll({
      title: "New Governance Proposal",
      body: inserted.title,
      data: {
        screen: "governance",
        proposalId: inserted.id,
        deepLink: "osanvault-mobile://governance",
      },
    }).catch(() => {});
  }

  res.status(201).json(inserted);
});

export default router;
