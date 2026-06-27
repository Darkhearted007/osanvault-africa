import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const devicePushTokensTable = pgTable("device_push_tokens", {
  id:        serial("id").primaryKey(),
  token:     text("token").notNull().unique(),
  platform:  text("platform").notNull().default("unknown"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DevicePushToken = typeof devicePushTokensTable.$inferSelect;
