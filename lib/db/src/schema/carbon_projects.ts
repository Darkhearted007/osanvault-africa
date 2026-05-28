import {
  pgTable, serial, text, integer, boolean, doublePrecision, timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const carbonProjectsTable = pgTable("carbon_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  methodology: text("methodology").notNull(),
  region: text("region").notNull(),
  vintage: integer("vintage").notNull(),
  totalIssued: text("total_issued").notNull(),
  totalRetired: text("total_retired").notNull(),
  verified: boolean("verified").notNull().default(false),
  verifier: text("verifier").notNull(),
  flag: text("flag").notNull(),
  description: text("description").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  registryLink: text("registry_link").notNull(),
  linkedPropertyId: integer("linked_property_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCarbonProjectSchema = createInsertSchema(carbonProjectsTable).omit({
  id: true, createdAt: true,
});
export type InsertCarbonProject = z.infer<typeof insertCarbonProjectSchema>;
export type CarbonProject = typeof carbonProjectsTable.$inferSelect;
