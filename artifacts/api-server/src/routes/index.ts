import { Router, type IRouter } from "express";
import healthRouter        from "./health";
import propertiesRouter    from "./properties";
import assetsRouter        from "./assets";
import carbonRouter        from "./carbon";
import governanceRouter    from "./governance";
import activityRouter      from "./activity";
import platformStatsRouter from "./platform-stats";
import whitelistRouter     from "./whitelist";
import leadsRouter         from "./leads";
import deviceTokensRouter  from "./device-tokens";

const router: IRouter = Router();

router.use(healthRouter);
// Legacy prototype contract: intentionally unchanged.
router.use(propertiesRouter);
// Canonical Asset Registry: additive beside the legacy property API.
router.use(assetsRouter);
router.use(carbonRouter);
router.use(governanceRouter);
router.use(activityRouter);
router.use(platformStatsRouter);
router.use(whitelistRouter);
router.use(leadsRouter);
router.use(deviceTokensRouter);

export default router;
