CREATE TYPE "public"."principal_type" AS ENUM('person', 'organization', 'service');
CREATE TYPE "public"."principal_status" AS ENUM('active', 'suspended', 'disabled');
CREATE TYPE "public"."membership_status" AS ENUM('active', 'suspended', 'revoked');

CREATE TABLE "principals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "type" "principal_type" NOT NULL,
  "status" "principal_status" DEFAULT 'active' NOT NULL,
  "display_name" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "updated_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "identities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "principal_id" uuid NOT NULL,
  "provider" text NOT NULL,
  "provider_subject" text NOT NULL,
  "email" text,
  "verified_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "organizations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "principal_id" uuid NOT NULL,
  "legal_name" text NOT NULL,
  "registration_country" text,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "organization_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "organization_principal_id" uuid NOT NULL,
  "member_principal_id" uuid NOT NULL,
  "status" "membership_status" DEFAULT 'active' NOT NULL,
  "role_name" text NOT NULL,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL UNIQUE,
  "description" text
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "key" text NOT NULL UNIQUE,
  "description" text
);

CREATE TABLE "role_permissions" (
  "role_id" uuid NOT NULL,
  "permission_id" uuid NOT NULL
);

CREATE TABLE "principal_roles" (
  "principal_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "organization_principal_id" uuid
);

CREATE TABLE "sessions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "principal_id" uuid NOT NULL,
  "provider" text NOT NULL,
  "provider_session_id" text,
  "expires_at" timestamptz,
  "revoked_at" timestamptz,
  "created_at" timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE "service_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "principal_id" uuid NOT NULL,
  "name" text NOT NULL,
  "credential_reference" text,
  "created_at" timestamptz DEFAULT now() NOT NULL,
  "revoked_at" timestamptz
);

CREATE TABLE "principal_jurisdictions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "principal_id" uuid NOT NULL,
  "country_code" text NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "effective_from" timestamptz DEFAULT now() NOT NULL,
  "effective_to" timestamptz,
  "evidence_reference" text
);

CREATE UNIQUE INDEX "identities_provider_subject_unique" ON "identities" ("provider", "provider_subject");
CREATE INDEX "identities_principal_idx" ON "identities" ("principal_id");
CREATE UNIQUE INDEX "organization_memberships_unique" ON "organization_memberships" ("organization_principal_id", "member_principal_id", "role_name");
CREATE INDEX "organization_memberships_member_idx" ON "organization_memberships" ("member_principal_id");
CREATE UNIQUE INDEX "role_permissions_unique" ON "role_permissions" ("role_id", "permission_id");
CREATE UNIQUE INDEX "principal_roles_unique" ON "principal_roles" ("principal_id", "role_id", "organization_principal_id");
CREATE INDEX "sessions_principal_idx" ON "sessions" ("principal_id");
CREATE INDEX "sessions_expiry_idx" ON "sessions" ("expires_at");
CREATE UNIQUE INDEX "service_accounts_principal_unique" ON "service_accounts" ("principal_id");
CREATE INDEX "principal_jurisdictions_principal_country_idx" ON "principal_jurisdictions" ("principal_id", "country_code");

ALTER TABLE "identities" ADD CONSTRAINT "identities_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_organization_principal_id_principals_id_fk" FOREIGN KEY ("organization_principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "organization_memberships" ADD CONSTRAINT "organization_memberships_member_principal_id_principals_id_fk" FOREIGN KEY ("member_principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;
ALTER TABLE "principal_roles" ADD CONSTRAINT "principal_roles_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "principal_roles" ADD CONSTRAINT "principal_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;
ALTER TABLE "principal_roles" ADD CONSTRAINT "principal_roles_organization_principal_id_principals_id_fk" FOREIGN KEY ("organization_principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "service_accounts" ADD CONSTRAINT "service_accounts_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
ALTER TABLE "principal_jurisdictions" ADD CONSTRAINT "principal_jurisdictions_principal_id_principals_id_fk" FOREIGN KEY ("principal_id") REFERENCES "public"."principals"("id") ON DELETE CASCADE;
