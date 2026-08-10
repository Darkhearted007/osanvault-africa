import { pgTable, uuid, varchar, text, timestamp, integer } from "drizzle-orm/pg-core";
import { tenantsTable, platformUsersTable, partiesTable } from "./platform";
import { assetsTable } from "./assets";

export const documentsTable = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  documentType: varchar("document_type", { length: 64 }).notNull(),
  title: text("title").notNull(),
  storageRef: text("storage_ref").notNull(),
  contentHash: varchar("content_hash", { length: 128 }).notNull(),
  mimeType: varchar("mime_type", { length: 128 }),
  classification: varchar("classification", { length: 32 }).notNull().default("INTERNAL"),
  version: integer("version").notNull().default(1),
  source: text("source"),
  uploadedBy: uuid("uploaded_by").references(() => platformUsersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const evidenceTable = pgTable("evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: uuid("asset_id").references(() => assetsTable.id),
  documentId: uuid("document_id").references(() => documentsTable.id),
  evidenceType: varchar("evidence_type", { length: 64 }).notNull(),
  claim: text("claim").notNull(),
  sourcePartyId: uuid("source_party_id").references(() => partiesTable.id),
  confidence: varchar("confidence", { length: 32 }).notNull().default("UNVERIFIED"),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verificationCasesTable = pgTable("verification_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  assetId: uuid("asset_id").references(() => assetsTable.id),
  requestedBy: uuid("requested_by").references(() => platformUsersTable.id),
  verificationType: varchar("verification_type", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("OPEN"),
  confidence: varchar("confidence", { length: 32 }).notNull().default("LOW"),
  decision: varchar("decision", { length: 32 }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verificationEvidenceTable = pgTable("verification_evidence", {
  verificationCaseId: uuid("verification_case_id").notNull().references(() => verificationCasesTable.id),
  evidenceId: uuid("evidence_id").notNull().references(() => evidenceTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verificationActionsTable = pgTable("verification_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  verificationCaseId: uuid("verification_case_id").notNull().references(() => verificationCasesTable.id),
  actorId: uuid("actor_id").references(() => platformUsersTable.id),
  action: varchar("action", { length: 64 }).notNull(),
  finding: text("finding"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
