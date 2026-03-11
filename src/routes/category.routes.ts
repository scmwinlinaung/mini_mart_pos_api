import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkFeatureFlag } from '../middleware/featureFlag.middleware';
import validate from '../middleware/validation.middleware';
import * as categoryController from '../controllers/category.controller';
import * as categoryValidator from '../validators/category.validator';
import { USER_ROLES } from '../constants';

const router = Router();

// All category routes require FF_CATEGORIES to be enabled
router.use(checkFeatureFlag('FF_CATEGORIES'));

// Public routes (for getting categories - POS needs this)
router.get(
  '/',
  validate(categoryValidator.categoryQuerySchema, 'query'),
  categoryController.getAllCategories,
);

router.get('/:id', categoryController.getCategoryById);

// Protected routes (admin/manager only)
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(categoryValidator.createCategorySchema),
  categoryController.createCategory,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(categoryValidator.updateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  categoryController.deleteCategory,
);

export default router;
