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

// Search products (paginated)
router.get('/search', productController.searchProductsPaginated);

// Inventory management routes (admin/manager only)
router.get('/low-stock', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), productController.getLowStockProducts);
router.get('/low-stock-paginated', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), productController.getLowStockProductsPaginated);
router.get('/out-of-stock', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), productController.getOutOfStockProductsPaginated);
router.get('/summary', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), productController.getInventorySummary);

// Stock movement history route (admin/manager only)
router.get('/:id/stock-movements', authenticate, authorize(USER_ROLES.ADMIN, USER_ROLES.MANAGER), productController.getStockMovementHistory);

// Product by barcode and ID routes
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
