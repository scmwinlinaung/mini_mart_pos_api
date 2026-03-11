import { Router } from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import unitTypeRoutes from './unitType.routes';
import supplierRoutes from './supplier.routes';
import productRoutes from './product.routes';
import customerRoutes from './customer.routes';
import saleRoutes from './sale.routes';
import purchaseRoutes from './purchase.routes';
import expenseRoutes from './expense.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';
import reportRoutes from './report.routes';
import { getAllFeatureFlags } from '../middleware/featureFlag.middleware';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Feature flags endpoint
router.get('/features', (_req, res) => {
  const flags = getAllFeatureFlags();
  res.status(200).json({ flags });
});

// API routes
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/unit-types', unitTypeRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/products', productRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', saleRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/expenses', expenseRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);
router.use('/reports', reportRoutes);

export default router;
