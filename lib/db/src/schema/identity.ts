import { pgEnum, pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";

export const principalTypeEnum = pgEnum("principal_type", ["person", "organization", "service"]);
export const principalStatusEnum = pgEnum("principal_status", ["active", "suspended", "disabled"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "suspended", "revoked"]);

export const principals = pgTable("principals", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: principalTypeEnum("type").notNull(),
  status: principalStatusEnum("status").notNull().default("active"),
  displayName: text("display_name"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const identities = pgTable("identities", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerSubject: text("provider_subject").notNull(),
  email: text("email"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerSubjectUnique: uniqueIndex("identities_provider_subject_unique").on(table.provider, table.providerSubject),
  principalIdx: index("identities_principal_idx").on(table.principalId),
}));

export const organizations = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  legalName: text("legal_name").notNull(),
  registrationCountry: text("registration_country"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const organizationMemberships = pgTable("organization_memberships", {
  id: uuid("id").defaultRandom().primaryKey(),
  organizationPrincipalId: uuid("organization_principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  memberPrincipalId: uuid("member_principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  status: membershipStatusEnum("status").notNull().default("active"),
  roleName: text("role_name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  membershipUnique: uniqueIndex("organization_memberships_unique").on(table.organizationPrincipalId, table.memberPrincipalId, table.roleName),
  memberIdx: index("organization_memberships_member_idx").on(table.memberPrincipalId),
}));

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const permissions = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  description: text("description"),
});

export const rolePermissions = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  permissionId: uuid("permission_id").notNull().references(() => permissions.id, { onDelete: "cascade" }),
}, (table) => ({
  rolePermissionUnique: uniqueIndex("role_permissions_unique").on(table.roleId, table.permissionId),
}));

export const principalRoles = pgTable("principal_roles", {
  principalId: uuid("principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
  organizationPrincipalId: uuid("organization_principal_id").references(() => principals.id, { onDelete: "cascade" }),
}, (table) => ({
  principalRoleUnique: uniqueIndex("principal_roles_unique").on(table.principalId, table.roleId, table.organizationPrincipalId),
}));

export const sessions = pgTable("sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  providerSessionId: text("provider_session_id"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  principalIdx: index("sessions_principal_idx").on(table.principalId),
  expiryIdx: index("sessions_expiry_idx").on(table.expiresAt),
}));

export const serviceAccounts = pgTable("service_accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  credentialReference: text("credential_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
}, (table) => ({
  principalUnique: uniqueIndex("service_accounts_principal_unique").on(table.principalId),
}));

export const principalJurisdictions = pgTable("principal_jurisdictions", {
  id: uuid("id").defaultRandom().primaryKey(),
  principalId: uuid("principal_id").notNull().references(() => principals.id, { onDelete: "cascade" }),
  countryCode: text("country_code").notNull(),
  status: text("status").notNull().default("active"),
  effectiveFrom: timestamp("effective_from", { withTimezone: true }).defaultNow().notNull(),
  effectiveTo: timestamp("effective_to", { withTimezone: true }),
  evidenceReference: text("evidence_reference"),
}, (table) => ({
  principalCountryIdx: index("principal_jurisdictions_principal_country_idx").on(table.principalId, table.countryCode),
}));
