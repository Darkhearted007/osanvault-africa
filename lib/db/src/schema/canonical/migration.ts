import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable } from "./platform";

export const legacyEntityMapTable = pgTable("legacy_entity_map", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenantsTable.id),
  legacyType: varchar("legacy_type", { length: 64 }).notNull(),
  legacyId: text("legacy_id").notNull(),
  canonicalType: varchar("canonical_type", { length: 64 }).notNull(),
  canonicalId: uuid("canonical_id").notNull(),
  migrationVersion: varchar("migration_version", { length: 32 }).notNull(),
  migrationStatus: varchar("migration_status", { length: 32 }).notNull().default("MAPPED"),
  notes: text("notes"),
  migratedAt: timestamp("migrated_at", { withTimezone: true }).notNull().defaultNow(),
});
