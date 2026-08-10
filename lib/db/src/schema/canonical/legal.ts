import { pgTable, uuid, varchar, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { tenantsTable, partiesTable, jurisdictionsTable, legalEntitiesTable } from "./platform";
import { assetsTable } from "./assets";

export const spvsTable = pgTable("spvs", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  legalEntityId: uuid("legal_entity_id").notNull().unique().references(() => legalEntitiesTable.id),
  purpose: text("purpose"),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const ownershipInterestsTable = pgTable("ownership_interests", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: uuid("asset_id").notNull().references(() => assetsTable.id),
  holderPartyId: uuid("holder_party_id").notNull().references(() => partiesTable.id),
  interestPercentage: doublePrecision("interest_percentage"),
  interestType: varchar("interest_type", { length: 64 }).notNull().default("OWNERSHIP"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  basisEvidenceId: uuid("basis_evidence_id"),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assetRightsTable = pgTable("asset_rights", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: uuid("asset_id").notNull().references(() => assetsTable.id),
  holderPartyId: uuid("holder_party_id").references(() => partiesTable.id),
  jurisdictionId: uuid("jurisdiction_id").references(() => jurisdictionsTable.id),
  rightType: varchar("right_type", { length: 64 }).notNull(),
  description: text("description"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assetEncumbrancesTable = pgTable("asset_encumbrances", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: uuid("asset_id").notNull().references(() => assetsTable.id),
  encumbranceType: varchar("encumbrance_type", { length: 64 }).notNull(),
  holderPartyId: uuid("holder_party_id").references(() => partiesTable.id),
  description: text("description"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
