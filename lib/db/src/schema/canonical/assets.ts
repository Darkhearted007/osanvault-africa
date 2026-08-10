import { pgTable, uuid, varchar, text, timestamp, doublePrecision, uniqueIndex, primaryKey } from "drizzle-orm/pg-core";
import { tenantsTable, jurisdictionsTable, partiesTable } from "./platform";

export const assetTypesTable = pgTable("asset_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  parentId: uuid("parent_id"),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assetsTable = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  assetTypeId: uuid("asset_type_id").notNull().references(() => assetTypesTable.id),
  jurisdictionId: uuid("jurisdiction_id").references(() => jurisdictionsTable.id),
  canonicalCode: varchar("canonical_code", { length: 96 }).notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  lifecycleStatus: varchar("lifecycle_status", { length: 32 }).notNull().default("DRAFT"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assetIdentifiersTable = pgTable("asset_identifiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").notNull().references(() => assetsTable.id),
  identifierType: varchar("identifier_type", { length: 64 }).notNull(),
  identifierValue: text("identifier_value").notNull(),
  issuingAuthority: text("issuing_authority"),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validTo: timestamp("valid_to", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [uniqueIndex("asset_identifier_unique").on(table.identifierType, table.identifierValue)]);

export const assetLocationsTable = pgTable("asset_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").notNull().references(() => assetsTable.id),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  address: text("address"),
  locality: text("locality"),
  subdivision: text("subdivision"),
  countryCode: varchar("country_code", { length: 3 }),
  geometryRef: text("geometry_ref"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const assetRelationshipsTable = pgTable("asset_relationships", {
  assetId: uuid("asset_id").notNull().references(() => assetsTable.id),
  relatedAssetId: uuid("related_asset_id").notNull().references(() => assetsTable.id),
  relationshipType: varchar("relationship_type", { length: 64 }).notNull(),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [primaryKey({ columns: [table.assetId, table.relatedAssetId, table.relationshipType] })]);

export const assetPassportsTable = pgTable("asset_passports", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").notNull().unique().references(() => assetsTable.id),
  provenanceSummary: text("provenance_summary"),
  characteristics: text("characteristics"),
  verificationStatus: varchar("verification_status", { length: 32 }).notNull().default("UNVERIFIED"),
  confidenceLevel: varchar("confidence_level", { length: 32 }).notNull().default("LOW"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
