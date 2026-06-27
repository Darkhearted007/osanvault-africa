import {
  pgTable, serial, text, integer, timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const activityEventsTable = pgTable("activity_events", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(),
  propertyId: integer("property_id"),
  propertyName: text("property_name"),
  projectId: integer("project_id"),
  projectName: text("project_name"),
  amount: text("amount").notNull(),
  amountNgn: integer("amount_ngn"),
  address: text("address").notNull(),
  txHash: text("tx_hash").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertActivityEventSchema = createInsertSchema(activityEventsTable).omit({
  id: true, createdAt: true,
});
export type InsertActivityEvent = z.infer<typeof insertActivityEventSchema>;
export type ActivityEvent = typeof activityEventsTable.$inferSelect;
