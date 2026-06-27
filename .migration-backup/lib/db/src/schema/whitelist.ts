import {
  pgTable, serial, text, bigint, timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const whitelistTable = pgTable("whitelist", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  status: text("status").notNull().default("pending"),
  kycLevel: text("kyc_level").notNull().default("basic"),
  investorType: text("investor_type").notNull().default("individual"),
  jurisdiction: text("jurisdiction").notNull().default(""),
  investmentCapNgn: bigint("investment_cap_ngn", { mode: "number" }).notNull().default(0),
  addedBy: text("added_by").notNull().default("admin"),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertWhitelistSchema = createInsertSchema(whitelistTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertWhitelist = z.infer<typeof insertWhitelistSchema>;
export type WhitelistEntry = typeof whitelistTable.$inferSelect;

export const WHITELIST_STATUSES = ["pending", "approved", "rejected", "revoked"] as const;
export const KYC_LEVELS = ["basic", "advanced", "institutional"] as const;
export const INVESTOR_TYPES = ["individual", "hni", "institutional", "fund"] as const;
