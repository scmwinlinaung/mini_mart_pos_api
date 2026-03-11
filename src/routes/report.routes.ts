import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkFeatureFlag } from '../middleware/featureFlag.middleware';
import * as reportController from '../controllers/report.controller';
import { USER_ROLES } from '../constants';

const router = Router();

router.use(checkFeatureFlag('FF_REPORTS'));
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER));

router.get('/sales', reportController.getSalesReport);
router.get('/profit-loss', reportController.getProfitLossReport);
router.get('/inventory', reportController.getInventoryReport);
router.get('/purchases', reportController.getPurchaseReport);
router.get('/expenses', reportController.getExpenseReport);
router.get('/all', reportController.getAllReports);

export default router;
