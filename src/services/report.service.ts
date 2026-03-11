import { Op } from 'sequelize';
import { Sale, Product, Expense, Purchase, PurchaseItem, Category, StockMovement } from '../models';
import { startOfMonth, endOfMonth } from 'date-fns';
import logger from '../utils/logger.util';

interface SalesReportData {
  totalSales: number;
  totalRevenue: number;
  totalItemsSold: number;
  averageTransactionValue: number;
  salesByPaymentMethod: Record<string, number>;
}

interface ProfitLossData {
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  monthlyData: any[];
}

interface InventoryReportData {
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  productsByCategory: Record<string, number>;
}

class ReportService {
  async getSalesReport(startDate: Date, endDate: Date): Promise<SalesReportData> {
    try {
      const sales = await Sale.findAll({
        where: {
          isActive: true,
          paymentStatus: 'PAID',
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      const totalSales = sales.length;
      const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
      const totalItemsSold = sales.reduce((sum, s) => sum + s.quantity, 0);
      const averageTransactionValue = totalSales > 0 ? totalRevenue / totalSales : 0;

      const salesByPaymentMethod: Record<string, number> = {};
      sales.forEach((sale) => {
        const method = sale.paymentMethod;
        salesByPaymentMethod[method] = (salesByPaymentMethod[method] || 0) + 1;
      });

      return {
        totalSales,
        totalRevenue,
        totalItemsSold,
        averageTransactionValue,
        salesByPaymentMethod,
      };
    } catch (error) {
      logger.error('Get sales report service error:', error);
      throw error;
    }
  }

  async getProfitLossReport(startDate: Date, endDate: Date): Promise<ProfitLossData> {
    try {
      // Get sales data
      const sales = await Sale.findAll({
        where: {
          isActive: true,
          paymentStatus: 'PAID',
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: ['product'],
      });

      let totalRevenue = 0;
      let totalCost = 0;

      sales.forEach((sale) => {
        totalRevenue += sale.grandTotal;
        if (sale.product) {
          totalCost += sale.product.costPrice * sale.quantity;
        }
      });

      const grossProfit = totalRevenue - totalCost;

      // Get expenses
      const expenses = await Expense.findAll({
        where: {
          isActive: true,
          expenseDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const netProfit = grossProfit - totalExpenses;
      const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

      // Monthly breakdown
      const monthlyData: any[] = [];
      const currentMonth = new Date(startDate);
      while (currentMonth <= endDate) {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        const monthSales = sales.filter((s) => s.createdAt >= monthStart && s.createdAt <= monthEnd);
        const monthExpenses = expenses.filter((e) => e.expenseDate >= monthStart && e.expenseDate <= monthEnd);

        const monthRevenue = monthSales.reduce((sum, s) => sum + s.grandTotal, 0);
        const monthCost = monthSales.reduce((sum, s) => s.product?.costPrice ? sum + s.product.costPrice * s.quantity : sum, 0);
        const monthExp = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

        monthlyData.push({
          month: monthStart.getMonth() + 1,
          year: monthStart.getFullYear(),
          revenue: monthRevenue,
          cost: monthCost,
          profit: monthRevenue - monthCost - monthExp,
          expenses: monthExp,
        });

        currentMonth.setMonth(currentMonth.getMonth() + 1);
      }

      return {
        totalRevenue,
        totalCost,
        grossProfit,
        totalExpenses,
        netProfit,
        profitMargin,
        monthlyData,
      };
    } catch (error) {
      logger.error('Get profit loss report service error:', error);
      throw error;
    }
  }

  async getInventoryReport(): Promise<InventoryReportData> {
    try {
      const products = await Product.findAll({
        where: { isActive: true },
        include: ['category'],
      });

      const totalProducts = products.length;
      let totalStockValue = 0;
      let lowStockProducts = 0;
      let outOfStockProducts = 0;

      const productsByCategory: Record<string, number> = {};

      for (const product of products) {
        totalStockValue += product.costPrice * product.stockQuantity;

        if (product.stockQuantity === 0) {
          outOfStockProducts++;
        } else if (product.stockQuantity <= product.reorderLevel) {
          lowStockProducts++;
        }

        const categoryName = product.category?.categoryName || 'Uncategorized';
        productsByCategory[categoryName] = (productsByCategory[categoryName] || 0) + 1;
      }

      return {
        totalProducts,
        totalStockValue,
        lowStockProducts,
        outOfStockProducts,
        productsByCategory,
      };
    } catch (error) {
      logger.error('Get inventory report service error:', error);
      throw error;
    }
  }

  async getPurchaseReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const purchases = await Purchase.findAll({
        where: {
          isActive: true,
          purchaseDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: ['supplier', 'user', { model: PurchaseItem, as: 'items', include: ['product'] }],
        order: [['purchaseDate', 'DESC']],
      });

      let totalPurchases = purchases.length;
      let totalAmount = purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

      const purchasesBySupplier: Record<string, any> = {};

      purchases.forEach((purchase) => {
        const supplierName = purchase.supplier?.companyName || 'Unknown';
        if (!purchasesBySupplier[supplierName]) {
          purchasesBySupplier[supplierName] = {
            count: 0,
            totalAmount: 0,
          };
        }
        purchasesBySupplier[supplierName].count++;
        purchasesBySupplier[supplierName].totalAmount += purchase.totalAmount || 0;
      });

      return {
        totalPurchases,
        totalAmount,
        purchasesBySupplier,
        details: purchases.map((p) => ({
          purchaseId: p.purchaseId,
          supplierInvoiceNo: p.supplierInvoiceNo,
          supplierName: p.supplier?.companyName,
          totalAmount: p.totalAmount,
          status: p.status,
          purchaseDate: p.purchaseDate,
          itemCount: (p as any).items?.length || 0,
        })),
      };
    } catch (error) {
      logger.error('Get purchase report service error:', error);
      throw error;
    }
  }

  async getExpenseReport(startDate: Date, endDate: Date): Promise<any> {
    try {
      const expenses = await Expense.findAll({
        where: {
          isActive: true,
          expenseDate: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: ['category', 'user'],
        order: [['expenseDate', 'DESC']],
      });

      let totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

      const expensesByCategory: Record<string, number> = {};

      expenses.forEach((expense) => {
        const categoryName = expense.category?.categoryName || 'Uncategorized';
        expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + expense.amount;
      });

      return {
        totalExpenses,
        expensesByCategory,
        details: expenses.map((e) => ({
          expenseId: e.expenseId,
          title: e.title,
          categoryName: e.category?.categoryName,
          amount: e.amount,
          expenseDate: e.expenseDate,
          userName: e.user?.fullName,
        })),
      };
    } catch (error) {
      logger.error('Get expense report service error:', error);
      throw error;
    }
  }

  async getAllReports(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [salesReport, profitLossReport, inventoryReport, purchaseReport, expenseReport] = await Promise.all([
        this.getSalesReport(startDate, endDate),
        this.getProfitLossReport(startDate, endDate),
        this.getInventoryReport(),
        this.getPurchaseReport(startDate, endDate),
        this.getExpenseReport(startDate, endDate),
      ]);

      return {
        period: { startDate, endDate },
        sales: salesReport,
        profitLoss: profitLossReport,
        inventory: inventoryReport,
        purchases: purchaseReport,
        expenses: expenseReport,
      };
    } catch (error) {
      logger.error('Get all reports service error:', error);
      throw error;
    }
  }

  // Additional report methods for Flutter report screen

  async getProductPerformanceReport(startDate: Date, endDate: Date, limit?: number): Promise<any[]> {
    try {
      const products = await Product.findAll({
        where: { isActive: true },
        include: ['category'],
      });

      const sales = await Sale.findAll({
        where: {
          isActive: true,
          paymentStatus: 'PAID',
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: ['product'],
      });

      const productPerformance: any[] = [];

      products.forEach((product) => {
        const productSales = sales.filter((s) => s.productId === product.productId);

        if (productSales.length > 0) {
          const quantitySold = productSales.reduce((sum, s) => sum + s.quantity, 0);
          const revenue = productSales.reduce((sum, s) => sum + s.grandTotal, 0);
          const cost = productSales.reduce((sum, s) => sum + (product.costPrice * s.quantity), 0);
          const profit = revenue - cost;

          productPerformance.push({
            productId: product.productId,
            productName: product.productName,
            barcode: product.barcode,
            categoryName: product.category?.categoryName,
            quantitySold,
            revenue,
            cost,
            profit,
            timesSold: productSales.length,
          });
        }
      });

      productPerformance.sort((a, b) => b.revenue - a.revenue);

      if (limit) {
        return productPerformance.slice(0, limit);
      }

      return productPerformance;
    } catch (error) {
      logger.error('Get product performance report service error:', error);
      throw error;
    }
  }

  async getCategoryPerformanceReport(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const categories = await Category.findAll({
        where: { isActive: true },
        include: [{
          model: Product,
          as: 'products',
          where: { isActive: true },
          required: false,
        }],
      });

      const sales = await Sale.findAll({
        where: {
          isActive: true,
          paymentStatus: 'PAID',
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: ['product'],
      });

      const categoryPerformance: any[] = [];

      categories.forEach((category) => {
        const categorySales = sales.filter((s) => s.product?.categoryId === category.categoryId);

        const productCount = (category as any).products?.length || 0;
        let totalRevenue = 0;
        let totalCost = 0;
        let itemsSold = 0;

        categorySales.forEach((sale) => {
          totalRevenue += sale.grandTotal;
          if (sale.product) {
            totalCost += sale.product.costPrice * sale.quantity;
          }
          itemsSold += sale.quantity;
        });

        if (itemsSold > 0) {
          categoryPerformance.push({
            categoryId: category.categoryId,
            categoryName: category.categoryName,
            productCount,
            totalRevenue,
            totalCost,
            totalProfit: totalRevenue - totalCost,
            itemsSold,
          });
        }
      });

      categoryPerformance.sort((a, b) => b.totalRevenue - a.totalRevenue);

      return categoryPerformance;
    } catch (error) {
      logger.error('Get category performance report service error:', error);
      throw error;
    }
  }

  async getStockMovementsReport(startDate: Date, endDate: Date, movementType?: string): Promise<any[]> {
    try {
      const where: any = {
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      };

      if (movementType) {
        where.movementType = movementType;
      }

      const movements = await StockMovement.findAll({
        where,
        include: ['product', 'user'],
        order: [['createdAt', 'DESC']],
      });

      return movements.map((m) => ({
        movementId: m.movementId,
        createdAt: m.createdAt,
        movementType: m.movementType,
        productId: m.productId,
        productName: m.product?.productName,
        quantity: m.quantity,
        notes: m.notes,
        userName: m.user?.fullName,
      }));
    } catch (error) {
      logger.error('Get stock movements report service error:', error);
      throw error;
    }
  }

  async getDailySalesReport(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const sales = await Sale.findAll({
        where: {
          isActive: true,
          paymentStatus: 'PAID',
          createdAt: {
            [Op.between]: [startDate, endDate],
          },
        },
        include: ['product'],
        order: [['createdAt', 'ASC']],
      });

      // Group by date
      const salesByDate: Record<string, any> = {};

      sales.forEach((sale) => {
        const dateKey = sale.createdAt.toISOString().split('T')[0];
        if (!salesByDate[dateKey]) {
          salesByDate[dateKey] = {
            date: dateKey,
            transactionCount: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
            itemsSold: 0,
            avgTransaction: 0,
          };
        }

        const cost = sale.product?.costPrice || 0;
        salesByDate[dateKey].transactionCount += 1;
        salesByDate[dateKey].totalRevenue += sale.grandTotal;
        salesByDate[dateKey].totalCost += cost * sale.quantity;
        salesByDate[dateKey].itemsSold += sale.quantity;
      });

      // Calculate profit and avg transaction
      Object.keys(salesByDate).forEach((date) => {
        const data = salesByDate[date];
        data.totalProfit = data.totalRevenue - data.totalCost;
        data.avgTransaction = data.transactionCount > 0 ? data.totalRevenue / data.transactionCount : 0;
      });

      return Object.values(salesByDate);
    } catch (error) {
      logger.error('Get daily sales report service error:', error);
      throw error;
    }
  }
}

export default new ReportService();
