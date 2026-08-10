import { pgTable, uuid, varchar, text, timestamp, boolean } from "drizzle-orm/pg-core";

const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const tenantsTable = pgTable("tenants", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  tenantType: varchar("tenant_type", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  ...auditColumns,
});

export const jurisdictionsTable = pgTable("jurisdictions", {
  id: uuid("id").defaultRandom().primaryKey(),
  countryCode: varchar("country_code", { length: 3 }).notNull(),
  countryName: text("country_name").notNull(),
  subdivisionCode: varchar("subdivision_code", { length: 32 }),
  subdivisionName: text("subdivision_name"),
  localCode: varchar("local_code", { length: 64 }),
  localName: text("local_name"),
  jurisdictionType: varchar("jurisdiction_type", { length: 32 }).notNull(),
  ...auditColumns,
});

export const partiesTable = pgTable("parties", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyType: varchar("party_type", { length: 32 }).notNull(),
  displayName: text("display_name").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  jurisdictionId: uuid("jurisdiction_id").references(() => jurisdictionsTable.id),
  ...auditColumns,
});

export const personsTable = pgTable("persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id").notNull().unique().references(() => partiesTable.id),
  givenName: text("given_name").notNull(),
  middleName: text("middle_name"),
  familyName: text("family_name").notNull(),
  dateOfBirth: timestamp("date_of_birth", { mode: "date" }),
  ...auditColumns,
});

export const legalEntitiesTable = pgTable("legal_entities", {
  id: uuid("id").defaultRandom().primaryKey(),
  partyId: uuid("party_id").notNull().unique().references(() => partiesTable.id),
  registrationNumber: varchar("registration_number", { length: 128 }),
  legalName: text("legal_name").notNull(),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  incorporationDate: timestamp("incorporation_date", { mode: "date" }),
  ...auditColumns,
});

export const organizationsTable = pgTable("organizations", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  partyId: uuid("party_id").notNull().unique().references(() => partiesTable.id),
  organizationType: varchar("organization_type", { length: 64 }).notNull(),
  ...auditColumns,
});

export const platformUsersTable = pgTable("platform_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenantsTable.id),
  partyId: uuid("party_id").references(() => partiesTable.id),
  email: varchar("email", { length: 320 }).notNull().unique(),
  status: varchar("status", { length: 32 }).notNull().default("ACTIVE"),
  emailVerified: boolean("email_verified").notNull().default(false),
  ...auditColumns,
});
