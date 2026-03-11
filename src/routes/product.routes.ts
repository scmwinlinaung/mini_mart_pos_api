import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { checkFeatureFlag } from '../middleware/featureFlag.middleware';
import validate from '../middleware/validation.middleware';
import * as productController from '../controllers/product.controller';
import * as productValidator from '../validators/product.validator';
import { USER_ROLES } from '../constants';

const router = Router();

router.use(checkFeatureFlag('FF_PRODUCTS'));

// Public routes for POS
router.get(
  '/',
  validate(productValidator.productQuerySchema, 'query'),
  productController.getAllProducts,
);

router.get('/low-stock', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), productController.getLowStockProducts);
router.get('/:id', productController.getProductById);
router.get('/barcode/:barcode', productController.getProductByBarcode);

// Protected routes (admin/manager only)
router.post(
  '/',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(productValidator.createProductSchema),
  productController.createProduct,
);

router.put(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  validate(productValidator.updateProductSchema),
  productController.updateProduct,
);

router.delete(
  '/:id',
  authenticate,
  authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER),
  productController.deleteProduct,
);

export default router;
