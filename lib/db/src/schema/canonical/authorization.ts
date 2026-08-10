import { pgTable, uuid, varchar, text, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { tenantsTable, platformUsersTable } from "./platform";

export const rolesTable = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").notNull().references(() => tenantsTable.id),
  code: varchar("code", { length: 64 }).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const permissionsTable = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 128 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rolePermissionsTable = pgTable("role_permissions", {
  roleId: uuid("role_id").notNull().references(() => rolesTable.id),
  permissionId: uuid("permission_id").notNull().references(() => permissionsTable.id),
}, (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })]);

export const userRolesTable = pgTable("user_roles", {
  userId: uuid("user_id").notNull().references(() => platformUsersTable.id),
  roleId: uuid("role_id").notNull().references(() => rolesTable.id),
  assignedAt: timestamp("assigned_at", { withTimezone: true }).notNull().defaultNow(),
  assignedBy: uuid("assigned_by").references(() => platformUsersTable.id),
}, (table) => [primaryKey({ columns: [table.userId, table.roleId] })]);
