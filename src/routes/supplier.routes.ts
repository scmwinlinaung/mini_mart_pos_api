import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import validate from '../middleware/validation.middleware';
import * as supplierController from '../controllers/supplier.controller';
import * as supplierValidator from '../validators/supplier.validator';
import { USER_ROLES } from '../constants';

const router = Router();

router.get(
  '/',
  validate(supplierValidator.supplierQuerySchema, 'query'),
  supplierController.getAllSuppliers,
);

router.get('/:id', supplierController.getSupplierById);

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(supplierValidator.createSupplierSchema),
  supplierController.createSupplier,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(supplierValidator.updateSupplierSchema),
  supplierController.updateSupplier,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  supplierController.deleteSupplier,
);

export default router;
