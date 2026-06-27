import { Router, type IRouter } from "express";
import { sql, ne } from "drizzle-orm";
import { db, propertiesTable, activityEventsTable } from "@workspace/db";
import { GetPlatformStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/platform-stats", async (_req, res): Promise<void> => {
  const [propStats] = await db
    .select({
      propertiesLive: sql<number>`cast(count(*) filter (where ${propertiesTable.status} != 'closed') as int)`,
      tvlNgn: sql<number>`coalesce(sum(${propertiesTable.raised}), 0)`,
      totalCarbonTonnes: sql<number>`coalesce(sum(${propertiesTable.carbonOffsetTonnes}), 0)`,
      avgPropertyYield: sql<number>`coalesce(avg(${propertiesTable.yieldApy}), 0)`,
    })
    .from(propertiesTable);

  const [activityStats] = await db
    .select({
      totalInvestors: sql<number>`cast(count(distinct ${activityEventsTable.address}) as int)`,
    })
    .from(activityEventsTable)
    .where(ne(activityEventsTable.type, "vote"));

  const stats = {
    propertiesLive: propStats?.propertiesLive ?? 0,
    tvlNgn: Number(propStats?.tvlNgn ?? 0),
    totalInvestors: activityStats?.totalInvestors ?? 0,
    osanvStaked: 42_500_000,
    totalCarbonTonnes: Number(propStats?.totalCarbonTonnes ?? 0),
    avgPropertyYield: Number((propStats?.avgPropertyYield ?? 0).toFixed(1)),
  };

  res.json(GetPlatformStatsResponse.parse(stats));
});

export default router;
