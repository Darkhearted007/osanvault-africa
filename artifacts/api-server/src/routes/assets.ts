import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, canonicalAssetsTable, canonicalAssetTypesTable } from "@workspace/db";
import {
  CanonicalAssetIdParams,
  CanonicalAssetListQuery,
  CanonicalAssetListResponse,
  CanonicalAssetResponse,
  CanonicalAssetTypeListResponse,
  CreateCanonicalAssetBody,
  UpdateCanonicalAssetBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/assets/types", async (_req, res): Promise<void> => {
  try {
    const rows = await db
      .select()
      .from(canonicalAssetTypesTable)
      .where(eq(canonicalAssetTypesTable.active, true))
      .orderBy(canonicalAssetTypesTable.name);

    res.json(CanonicalAssetTypeListResponse.parse(rows));
  } catch (error) {
    res.status(503).json({ error: "Canonical asset registry is unavailable" });
  }
});

router.get("/assets", async (req, res): Promise<void> => {
  const query = CanonicalAssetListQuery.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  try {
    const filters = [];
    if (query.data.status) filters.push(eq(canonicalAssetsTable.status, query.data.status));
    if (query.data.assetTypeId) filters.push(eq(canonicalAssetsTable.assetTypeId, query.data.assetTypeId));
    if (query.data.jurisdictionId) filters.push(eq(canonicalAssetsTable.jurisdictionId, query.data.jurisdictionId));

    const rows = await db
      .select()
      .from(canonicalAssetsTable)
      .where(filters.length ? and(...filters) : undefined)
      .orderBy(canonicalAssetsTable.createdAt);

    res.json(CanonicalAssetListResponse.parse(rows));
  } catch (error) {
    res.status(503).json({ error: "Canonical asset registry is unavailable" });
  }
});

router.get("/assets/:id", async (req, res): Promise<void> => {
  const params = CanonicalAssetIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const [row] = await db
      .select()
      .from(canonicalAssetsTable)
      .where(eq(canonicalAssetsTable.id, params.data.id));

    if (!row) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    res.json(CanonicalAssetResponse.parse(row));
  } catch (error) {
    res.status(503).json({ error: "Canonical asset registry is unavailable" });
  }
});

router.post("/assets", async (req, res): Promise<void> => {
  const body = CreateCanonicalAssetBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    const [assetType] = await db
      .select({ id: canonicalAssetTypesTable.id })
      .from(canonicalAssetTypesTable)
      .where(and(eq(canonicalAssetTypesTable.id, body.data.assetTypeId), eq(canonicalAssetTypesTable.active, true)));

    if (!assetType) {
      res.status(422).json({ error: "Asset type not found or inactive" });
      return;
    }

    const [created] = await db
      .insert(canonicalAssetsTable)
      .values(body.data)
      .returning();

    res.status(201).json(CanonicalAssetResponse.parse(created));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to create asset";
    if (message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")) {
      res.status(409).json({ error: "Asset identifier already exists" });
      return;
    }
    res.status(503).json({ error: "Canonical asset registry is unavailable" });
  }
});

router.patch("/assets/:id", async (req, res): Promise<void> => {
  const params = CanonicalAssetIdParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = UpdateCanonicalAssetBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  try {
    if (body.data.assetTypeId) {
      const [assetType] = await db
        .select({ id: canonicalAssetTypesTable.id })
        .from(canonicalAssetTypesTable)
        .where(and(eq(canonicalAssetTypesTable.id, body.data.assetTypeId), eq(canonicalAssetTypesTable.active, true)));
      if (!assetType) {
        res.status(422).json({ error: "Asset type not found or inactive" });
        return;
      }
    }

    const [updated] = await db
      .update(canonicalAssetsTable)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(canonicalAssetsTable.id, params.data.id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    res.json(CanonicalAssetResponse.parse(updated));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unable to update asset";
    if (message.toLowerCase().includes("duplicate") || message.toLowerCase().includes("unique")) {
      res.status(409).json({ error: "Asset identifier already exists" });
      return;
    }
    res.status(503).json({ error: "Canonical asset registry is unavailable" });
  }
});

export default router;
