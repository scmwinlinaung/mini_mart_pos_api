import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import validate from '../middleware/validation.middleware';
import * as customerController from '../controllers/customer.controller';
import * as customerValidator from '../validators/customer.validator';
import { USER_ROLES } from '../constants';

const router = Router();

// Public routes (for POS)
router.get(
  '/',
  validate(customerValidator.customerQuerySchema, 'query'),
  customerController.getAllCustomers,
);

router.get('/phone/:phoneNumber', customerController.getCustomerByPhoneNumber);
router.get('/:id', customerController.getCustomerById);

// Protected routes (admin/manager only)
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(customerValidator.createCustomerSchema),
  customerController.createCustomer,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(customerValidator.updateCustomerSchema),
  customerController.updateCustomer,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  customerController.deleteCustomer,
);

export default router;
