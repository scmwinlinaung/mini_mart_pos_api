import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import * as stockMovementController from '../controllers/stockMovement.controller';
import { USER_ROLES } from '../constants';

const router = Router();

// All routes require authentication and admin/manager role
router.use(authenticate);
router.use(authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER));

// Create manual stock adjustment (damage, expired, theft, loss, correction)
router.post(
  '/',
  stockMovementController.createManualAdjustment,
);

// Get all stock movements with filtering (paginated)
router.get(
  '/',
  stockMovementController.getStockMovements,
);

// Get stock movement summary
router.get(
  '/summary',
  stockMovementController.getStockMovementSummary,
);

// Get loss report (damage, expired, theft, loss)
router.get(
  '/loss-report',
  stockMovementController.getLossReport,
);

// Get specific stock movement by ID
router.get(
  '/:id',
  stockMovementController.getStockMovementById,
);

// Get stock movements for a specific product (paginated)
router.get(
  '/product/:id',
  stockMovementController.getStockMovementsByProductId,
);

export default router;
