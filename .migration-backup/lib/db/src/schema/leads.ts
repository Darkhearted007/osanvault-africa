import { pgTable, serial, text, bigint, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const leadsTable = pgTable("leads", {
  id:             serial("id").primaryKey(),
  fullName:       text("full_name").notNull(),
  email:          text("email").notNull().unique(),
  phone:          text("phone").notNull().default(""),
  investorType:   text("investor_type").notNull().default("individual"),
  interestNgn:    bigint("interest_ngn", { mode: "number" }).notNull().default(0),
  jurisdiction:   text("jurisdiction").notNull().default("Nigeria"),
  source:         text("source").notNull().default("website"),
  message:        text("message").notNull().default(""),
  status:         text("status").notNull().default("new"),
  referenceCode:  text("reference_code").notNull().default(""),
  createdAt:      timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt:      timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leadsTable).omit({
  id: true, createdAt: true, updatedAt: true, referenceCode: true,
});
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leadsTable.$inferSelect;

export const LEAD_STATUSES    = ["new", "contacted", "qualified", "converted", "unqualified"] as const;
export const LEAD_SOURCES     = ["website", "referral", "twitter", "linkedin", "accelerator", "event", "other"] as const;
export const LEAD_INVESTOR_TYPES = ["individual", "hni", "institutional", "fund", "developer"] as const;
