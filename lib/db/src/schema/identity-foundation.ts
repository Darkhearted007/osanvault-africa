import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { canonicalOrganizationsTable, canonicalPartiesTable, canonicalJurisdictionsTable } from "./canonical-foundation";

/**
 * Provider-neutral identity layer.
 *
 * A principal is the security subject; a party remains the business participant.
 * Wallet addresses, email addresses and provider subjects are external identity
 * attributes and never become canonical business ownership identifiers.
 */
export const principalsTable = pgTable("principals", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: text("type").notNull(),
  status: text("status").notNull().default("active"),
  displayName: text("display_name"),
  partyId: uuid("party_id").references(() => canonicalPartiesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const identitiesTable = pgTable("identities", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principalsTable.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerSubject: text("provider_subject").notNull(),
  email: text("email"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizationMembershipsTable = pgTable("organization_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationId: uuid("organization_id").notNull().references(() => canonicalOrganizationsTable.id, { onDelete: "cascade" }),
  principalId: uuid("principal_id").notNull().references(() => principalsTable.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"),
  roleName: text("role_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const rolesTable = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  systemRole: boolean("system_role").notNull().default(false),
});

export const permissionsTable = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description"),
});

export const rolePermissionsTable = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissionsTable.id, { onDelete: "cascade" }),
});

export const principalRolesTable = pgTable("principal_roles", {
  principalId: uuid("principal_id").notNull().references(() => principalsTable.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => rolesTable.id, { onDelete: "cascade" }),
  organizationId: uuid("organization_id").references(() => canonicalOrganizationsTable.id, { onDelete: "cascade" }),
});

export const sessionsTable = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principalsTable.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerSessionId: text("provider_session_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const serviceAccountsTable = pgTable("service_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principalsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  credentialReference: text("credential_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
});

export const principalJurisdictionsTable = pgTable("principal_jurisdictions", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principalsTable.id, { onDelete: "cascade" }),
  jurisdictionId: uuid("jurisdiction_id").notNull().references(() => canonicalJurisdictionsTable.id),
  status: text("status").notNull().default("active"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).defaultNow().notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  evidenceReference: text("evidence_reference"),
});