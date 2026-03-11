import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { checkFeatureFlag } from '../middleware/featureFlag.middleware';
import validate from '../middleware/validation.middleware';
import * as dashboardController from '../controllers/dashboard.controller';
import * as dashboardValidator from '../validators/dashboard.validator';

const router = Router();

router.use(checkFeatureFlag('FF_DASHBOARD'));
router.use(authenticate);

router.get(
  '/summary',
  validate(dashboardValidator.dashboardQuerySchema, 'query'),
  dashboardController.getDashboardSummary,
);

router.get(
  '/monthly',
  validate(dashboardValidator.dashboardQuerySchema, 'query'),
  dashboardController.getMonthlyData,
);

router.get('/yearly', dashboardController.getYearlyData);
router.get('/low-stock', dashboardController.getLowStockProducts);
router.get('/recent-sales', dashboardController.getRecentSales);

export default router;
