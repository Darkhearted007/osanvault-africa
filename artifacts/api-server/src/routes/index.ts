import { Router, type IRouter } from "express";
import healthRouter from "./health";
import propertiesRouter from "./properties";
import carbonRouter from "./carbon";
import governanceRouter from "./governance";
import activityRouter from "./activity";
import platformStatsRouter from "./platform-stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(propertiesRouter);
router.use(carbonRouter);
router.use(governanceRouter);
router.use(activityRouter);
router.use(platformStatsRouter);

export default router;
