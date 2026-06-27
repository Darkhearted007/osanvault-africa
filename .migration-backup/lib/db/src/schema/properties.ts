import {
  pgTable, serial, text, integer, doublePrecision, timestamp, bigint,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  flag: text("flag").notNull(),
  targetRaise: bigint("target_raise", { mode: "number" }).notNull(),
  raised: bigint("raised", { mode: "number" }).notNull(),
  totalTokens: integer("total_tokens").notNull(),
  tokenPrice: integer("token_price").notNull(),
  yieldApy: doublePrecision("yield_apy").notNull(),
  size: text("size").notNull(),
  status: text("status").notNull(),
  carbonOffsetTonnes: integer("carbon_offset_tonnes").notNull().default(0),
  description: text("description").notNull(),
  gradientFrom: text("gradient_from").notNull().default("#1a3d1f"),
  gradientTo: text("gradient_to").notNull().default("#2d5a35"),
  jurisdiction: text("jurisdiction").notNull(),
  indigenousAuthority: text("indigenous_authority").notNull(),
  legalDocCid: text("legal_doc_cid").notNull(),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true, createdAt: true, updatedAt: true,
});
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
