import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkFeatureFlag } from '../middleware/featureFlag.middleware';
import validate from '../middleware/validation.middleware';
import * as expenseController from '../controllers/expense.controller';
import * as expenseValidator from '../validators/expense.validator';
import { USER_ROLES } from '../constants';

const router = Router();

router.use(checkFeatureFlag('FF_EXPENSES'));

router.get(
  '/',
  authenticate,
  validate(expenseValidator.expenseQuerySchema, 'query'),
  expenseController.getAllExpenses,
);

router.get('/categories', authenticate, expenseController.getExpenseCategories);
router.get('/summary', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), expenseController.getExpensesSummary);
router.get('/:id', authenticate, expenseController.getExpenseById);

router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(expenseValidator.createExpenseSchema),
  expenseController.createExpense,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(expenseValidator.updateExpenseSchema),
  expenseController.updateExpense,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN),
  expenseController.deleteExpense,
);

export default router;
