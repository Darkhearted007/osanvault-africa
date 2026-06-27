import {
  pgTable, serial, text, bigint, timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const governanceProposalsTable = pgTable("governance_proposals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  proposer: text("proposer").notNull(),
  status: text("status").notNull(),
  votesFor: bigint("votes_for", { mode: "number" }).notNull().default(0),
  votesAgainst: bigint("votes_against", { mode: "number" }).notNull().default(0),
  quorum: bigint("quorum", { mode: "number" }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertGovernanceProposalSchema = createInsertSchema(governanceProposalsTable).omit({
  id: true, createdAt: true,
});
export type InsertGovernanceProposal = z.infer<typeof insertGovernanceProposalSchema>;
export type GovernanceProposal = typeof governanceProposalsTable.$inferSelect;
