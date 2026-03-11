import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkFeatureFlag } from '../middleware/featureFlag.middleware';
import validate from '../middleware/validation.middleware';
import * as saleController from '../controllers/sale.controller';
import * as saleValidator from '../validators/sale.validator';
import { USER_ROLES } from '../constants';

const router = Router();

router.use(checkFeatureFlag('FF_SALES'));

// All sale routes require authentication except for specific public ones
router.get(
  '/',
  authenticate,
  validate(saleValidator.saleQuerySchema, 'query'),
  saleController.getAllSales,
);

router.get(
  '/today',
  authenticate,
  saleController.getTodaySales,
);

router.get(
  '/summary',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  saleController.getSalesSummary,
);

router.get('/:id', authenticate, saleController.getSaleById);

// Create sale - requires authentication
router.post(
  '/',
  authenticate,
  validate(saleValidator.createSaleSchema),
  saleController.createSale,
);

// Refund sale - admin/manager only
router.post(
  '/:id/refund',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(saleValidator.refundSchema),
  saleController.refundSale,
);

export default router;
