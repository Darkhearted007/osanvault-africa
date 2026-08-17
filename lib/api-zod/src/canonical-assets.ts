import { z } from "zod";

export const CanonicalAssetListQuery = z.object({
  status: z.string().trim().min(1).optional(),
  assetTypeId: z.string().uuid().optional(),
  jurisdictionId: z.string().uuid().optional(),
});

export const CanonicalAssetIdParams = z.object({
  id: z.string().uuid(),
});

export const CreateCanonicalAssetBody = z.object({
  assetIdentifier: z.string().trim().min(3).max(120),
  assetTypeId: z.string().uuid(),
  name: z.string().trim().min(1).max(240),
  description: z.string().max(5000).optional(),
  status: z.string().trim().min(1).max(64).optional(),
  tenantId: z.string().uuid().optional(),
  jurisdictionId: z.string().uuid().optional(),
  currentState: z.string().max(10000).optional(),
});

export const UpdateCanonicalAssetBody = CreateCanonicalAssetBody.partial().omit({ assetIdentifier: true });

export const CanonicalAssetResponse = z.object({
  id: z.string().uuid(),
  assetIdentifier: z.string(),
  assetTypeId: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  tenantId: z.string().uuid().nullable(),
  jurisdictionId: z.string().uuid().nullable(),
  currentState: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CanonicalAssetListResponse = z.array(CanonicalAssetResponse);

export const CanonicalAssetTypeResponse = z.object({
  id: z.string().uuid(),
  code: z.string(),
  name: z.string(),
  assetClass: z.string(),
  description: z.string().nullable(),
  active: z.boolean(),
});

export const CanonicalAssetTypeListResponse = z.array(CanonicalAssetTypeResponse);
