import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import validate from '../middleware/validation.middleware';
import * as purchaseController from '../controllers/purchase.controller';
import * as purchaseValidator from '../validators/purchase.validator';
import { USER_ROLES } from '../constants';

const router = Router();

router.get(
  '/',
  authenticate,
  validate(purchaseValidator.purchaseQuerySchema, 'query'),
  purchaseController.getAllPurchases,
);

router.get('/:id', authenticate, purchaseController.getPurchaseById);

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(purchaseValidator.createPurchaseSchema),
  purchaseController.createPurchase,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(purchaseValidator.updatePurchaseSchema),
  purchaseController.updatePurchase,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  purchaseController.deletePurchase,
);

export default router;
