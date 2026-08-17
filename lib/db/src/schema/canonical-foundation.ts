import {
  boolean,
  date,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * OV1 canonical foundation.
 *
 * This module is intentionally additive. It does not replace the prototype
 * `properties` model; legacy mapping is introduced separately so the running
 * prototype remains intact during migration.
 */

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
};

export const canonicalTenantsTable = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  tenantType: text("tenant_type").notNull(),
  jurisdictionId: uuid("jurisdiction_id"),
  status: text("status").notNull().default("active"),
  metadata: text("metadata"),
  ...timestamps,
});

export const canonicalOrganizationsTable = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  name: text("name").notNull(),
  organizationType: text("organization_type").notNull(),
  registrationIdentifier: text("registration_identifier"),
  jurisdictionId: uuid("jurisdiction_id"),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const canonicalPersonsTable = pgTable("persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  displayName: text("display_name"),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const canonicalPartiesTable = pgTable("parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  partyType: text("party_type").notNull(),
  personId: uuid("person_id").references(() => canonicalPersonsTable.id),
  organizationId: uuid("organization_id").references(() => canonicalOrganizationsTable.id),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const canonicalUsersTable = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id").notNull().references(() => canonicalPartiesTable.id),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  externalSubjectId: text("external_subject_id"),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const canonicalJurisdictionsTable = pgTable("jurisdictions", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  code: text("code").notNull(),
  name: text("name").notNull(),
  jurisdictionType: text("jurisdiction_type").notNull(),
  countryCode: text("country_code"),
  currencyCode: text("currency_code"),
  status: text("status").notNull().default("active"),
});

export const canonicalAssetTypesTable = pgTable("asset_types", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  assetClass: text("asset_class").notNull(),
  description: text("description"),
  active: boolean("active").notNull().default(true),
});

export const canonicalAssetsTable = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  assetIdentifier: text("asset_identifier").notNull().unique(),
  assetTypeId: uuid("asset_type_id").notNull().references(() => canonicalAssetTypesTable.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("captured"),
  jurisdictionId: uuid("jurisdiction_id").references(() => canonicalJurisdictionsTable.id),
  currentState: text("current_state"),
  ...timestamps,
});

export const canonicalAssetIdentifiersTable = pgTable("asset_identifiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").notNull().references(() => canonicalAssetsTable.id),
  identifierType: text("identifier_type").notNull(),
  identifierValue: text("identifier_value").notNull(),
  issuer: text("issuer"),
  jurisdictionId: uuid("jurisdiction_id").references(() => canonicalJurisdictionsTable.id),
  validFrom: timestamp("valid_from", { withTimezone: true }),
  validTo: timestamp("valid_to", { withTimezone: true }),
  evidenceId: uuid("evidence_id"),
  ...timestamps,
});

export const canonicalAssetLocationsTable = pgTable("asset_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").notNull().references(() => canonicalAssetsTable.id),
  jurisdictionId: uuid("jurisdiction_id").references(() => canonicalJurisdictionsTable.id),
  address: text("address"),
  latitude: numeric("latitude"),
  longitude: numeric("longitude"),
  isPrimary: boolean("is_primary").notNull().default(true),
  ...timestamps,
});

export const canonicalLegalEntitiesTable = pgTable("legal_entities", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  jurisdictionId: uuid("jurisdiction_id").notNull().references(() => canonicalJurisdictionsTable.id),
  legalName: text("legal_name").notNull(),
  entityType: text("entity_type").notNull(),
  registrationIdentifier: text("registration_identifier"),
  status: text("status").notNull().default("active"),
  formationDate: date("formation_date"),
  ...timestamps,
});

export const canonicalSpvsTable = pgTable("spvs", {
  id: uuid("id").defaultRandom().primaryKey(),
  legalEntityId: uuid("legal_entity_id").notNull().unique().references(() => canonicalLegalEntitiesTable.id),
  purpose: text("purpose").notNull(),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const canonicalAssetRightsTable = pgTable("asset_rights", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").notNull().references(() => canonicalAssetsTable.id),
  holderPartyId: uuid("holder_party_id").notNull().references(() => canonicalPartiesTable.id),
  rightType: text("right_type").notNull(),
  interestPercentage: numeric("interest_percentage"),
  priority: integer("priority"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  status: text("status").notNull().default("active"),
  basisDocumentId: uuid("basis_document_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const canonicalDocumentsTable = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  documentType: text("document_type").notNull(),
  title: text("title").notNull(),
  classification: text("classification").notNull().default("internal"),
  storageUri: text("storage_uri").notNull(),
  contentHash: text("content_hash").notNull(),
  mimeType: text("mime_type").notNull(),
  retentionPolicy: text("retention_policy"),
  legalHold: boolean("legal_hold").notNull().default(false),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const canonicalDocumentVersionsTable = pgTable("document_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  documentId: uuid("document_id").notNull().references(() => canonicalDocumentsTable.id),
  versionNumber: integer("version_number").notNull(),
  contentHash: text("content_hash").notNull(),
  storageUri: text("storage_uri").notNull(),
  createdBy: uuid("created_by").references(() => canonicalUsersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const canonicalEvidenceTable = pgTable("evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  evidenceType: text("evidence_type").notNull(),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  documentId: uuid("document_id").references(() => canonicalDocumentsTable.id),
  sourceType: text("source_type").notNull(),
  sourceReference: text("source_reference"),
  capturedBy: uuid("captured_by").references(() => canonicalUsersTable.id),
  capturedAt: timestamp("captured_at", { withTimezone: true }).notNull(),
  confidenceLevel: text("confidence_level"),
  status: text("status").notNull().default("active"),
  ...timestamps,
});

export const canonicalVerificationCasesTable = pgTable("verification_cases", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  verificationType: text("verification_type").notNull(),
  requestedByPartyId: uuid("requested_by_party_id").references(() => canonicalPartiesTable.id),
  assignedToPartyId: uuid("assigned_to_party_id").references(() => canonicalPartiesTable.id),
  status: text("status").notNull().default("open"),
  confidenceLevel: text("confidence_level"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  ...timestamps,
});

export const canonicalVerificationActionsTable = pgTable("verification_actions", {
  id: uuid("id").defaultRandom().primaryKey(),
  verificationCaseId: uuid("verification_case_id").notNull().references(() => canonicalVerificationCasesTable.id),
  actionType: text("action_type").notNull(),
  actorPartyId: uuid("actor_party_id").references(() => canonicalPartiesTable.id),
  evidenceId: uuid("evidence_id").references(() => canonicalEvidenceTable.id),
  finding: text("finding"),
  result: text("result"),
  performedAt: timestamp("performed_at", { withTimezone: true }).notNull(),
});

export const canonicalVerificationDecisionsTable = pgTable("verification_decisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  verificationCaseId: uuid("verification_case_id").notNull().unique().references(() => canonicalVerificationCasesTable.id),
  decision: text("decision").notNull(),
  decisionReason: text("decision_reason").notNull(),
  decidedByPartyId: uuid("decided_by_party_id").notNull().references(() => canonicalPartiesTable.id),
  decidedAt: timestamp("decided_at", { withTimezone: true }).notNull(),
  authorityReference: text("authority_reference"),
});

export const canonicalProjectsTable = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => canonicalTenantsTable.id),
  projectIdentifier: text("project_identifier").notNull().unique(),
  name: text("name").notNull(),
  projectType: text("project_type").notNull(),
  sponsorPartyId: uuid("sponsor_party_id").references(() => canonicalPartiesTable.id),
  spvId: uuid("spv_id").references(() => canonicalSpvsTable.id),
  status: text("status").notNull().default("draft"),
  jurisdictionId: uuid("jurisdiction_id").references(() => canonicalJurisdictionsTable.id),
  budgetAmount: numeric("budget_amount"),
  budgetCurrency: text("budget_currency"),
  plannedStart: date("planned_start"),
  plannedEnd: date("planned_end"),
  ...timestamps,
});

export const canonicalProjectAssetsTable = pgTable("project_assets", {
  projectId: uuid("project_id").notNull().references(() => canonicalProjectsTable.id),
  assetId: uuid("asset_id").notNull().references(() => canonicalAssetsTable.id),
  relationshipType: text("relationship_type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const canonicalProjectMilestonesTable = pgTable("project_milestones", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => canonicalProjectsTable.id),
  name: text("name").notNull(),
  description: text("description"),
  sequence: integer("sequence").notNull(),
  status: text("status").notNull().default("pending"),
  targetDate: date("target_date"),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  evidenceId: uuid("evidence_id").references(() => canonicalEvidenceTable.id),
  ...timestamps,
});

export const canonicalValuationsTable = pgTable("valuations", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").notNull().references(() => canonicalAssetsTable.id),
  valuationType: text("valuation_type").notNull(),
  value: numeric("value").notNull(),
  currencyCode: text("currency_code").notNull(),
  valuationDate: date("valuation_date").notNull(),
  validUntil: date("valid_until"),
  methodology: text("methodology").notNull(),
  methodologyVersion: text("methodology_version"),
  valuerPartyId: uuid("valuer_party_id").references(() => canonicalPartiesTable.id),
  evidenceId: uuid("evidence_id").references(() => canonicalEvidenceTable.id),
  confidenceLevel: text("confidence_level"),
  assumptions: text("assumptions"),
  ...timestamps,
});

export const canonicalRiskAssessmentsTable = pgTable("risk_assessments", {
  id: uuid("id").defaultRandom().primaryKey(),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id").notNull(),
  riskModel: text("risk_model").notNull(),
  riskModelVersion: text("risk_model_version").notNull(),
  overallScore: numeric("overall_score"),
  overallLevel: text("overall_level"),
  assessorPartyId: uuid("assessor_party_id").references(() => canonicalPartiesTable.id),
  evidenceSnapshot: text("evidence_snapshot"),
  assessedAt: timestamp("assessed_at", { withTimezone: true }).notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

export const canonicalRiskFactorsTable = pgTable("risk_factors", {
  id: uuid("id").defaultRandom().primaryKey(),
  riskAssessmentId: uuid("risk_assessment_id").notNull().references(() => canonicalRiskAssessmentsTable.id),
  category: text("category").notNull(),
  probability: numeric("probability"),
  impact: numeric("impact"),
  score: numeric("score"),
  description: text("description").notNull(),
  mitigation: text("mitigation"),
});

/** Maps legacy prototype IDs to canonical entities without mutating legacy records. */
export const canonicalLegacyMappingsTable = pgTable("legacy_entity_mappings", {
  id: uuid("id").defaultRandom().primaryKey(),
  sourceSystem: text("source_system").notNull().default("osanvault-prototype"),
  sourceEntityType: text("source_entity_type").notNull(),
  sourceEntityId: text("source_entity_id").notNull(),
  canonicalEntityType: text("canonical_entity_type").notNull(),
  canonicalEntityId: uuid("canonical_entity_id").notNull(),
  mappingStatus: text("mapping_status").notNull().default("mapped"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
