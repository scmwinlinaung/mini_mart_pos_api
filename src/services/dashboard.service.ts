import { Op, fn, col } from 'sequelize';
import { Sale, Product, Expense } from '../models';
import sequelize from '../models';
import logger from '../utils/logger.util';
import { startOfYear, endOfYear, startOfMonth, endOfMonth } from 'date-fns';

interface DashboardSummary {
  totalRevenue: number;
  totalCost: number;
  totalExpenses: number;
  profit: number;
  totalSales: number;
  totalProducts: number;
  lowStockProducts: number;
}

interface MonthlyData {
  month: number;
  monthName: string;
  revenue: number;
  cost: number;
  profit: number;
  expenses: number;
}

interface YearlyData {
  year: number;
  revenue: number;
  cost: number;
  profit: number;
  expenses: number;
}

class DashboardService {
  async getDashboardSummary(year?: number): Promise<DashboardSummary> {
    try {
      const currentYear = year || new Date().getFullYear();
      const startDate = startOfYear(new Date(currentYear, 0, 1));
      const endDate = endOfYear(new Date(currentYear, 0, 1));

      // Get sales data
      const salesResult = await Sale.findAll({
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

      salesResult.forEach((sale) => {
        totalRevenue += sale.grandTotal;
        if (sale.product) {
          totalCost += sale.product.costPrice * sale.quantity;
        }
      });

      // Get expenses
      const expensesResult = await Expense.findAll({
        where: {
          isActive: true,
          expenseDate: {
            [Op.between]: [startDate, endDate],
          },
        },
      });

      const totalExpenses = expensesResult.reduce((sum, exp) => sum + exp.amount, 0);

      // Get product counts
      const totalProducts = await Product.count({
        where: { isActive: true },
      });

      const lowStockProducts = await Product.count({
        where: {
          isActive: true,
          stockQuantity: {
            [Op.lte]: sequelize.col('reorder_level'),
          },
        },
      });

      const totalSales = salesResult.length;

      return {
        totalRevenue,
        totalCost,
        totalExpenses,
        profit: totalRevenue - totalCost - totalExpenses,
        totalSales,
        totalProducts,
        lowStockProducts,
      };
    } catch (error) {
      logger.error('Get dashboard summary service error:', error);
      throw error;
    }
  }

  async getMonthlyData(year: number): Promise<MonthlyData[]> {
    try {
      const monthlyData: MonthlyData[] = [];

      for (let month = 1; month <= 12; month++) {
        const startDate = startOfMonth(new Date(year, month - 1, 1));
        const endDate = endOfMonth(new Date(year, month - 1, 1));

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Get sales for this month
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

        let revenue = 0;
        let cost = 0;

        sales.forEach((sale) => {
          revenue += sale.grandTotal;
          if (sale.product) {
            cost += sale.product.costPrice * sale.quantity;
          }
        });

        // Get expenses for this month
        const expenses = await Expense.findAll({
          where: {
            isActive: true,
            expenseDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        });

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        monthlyData.push({
          month,
          monthName: monthNames[month - 1],
          revenue,
          cost,
          profit: revenue - cost - totalExpenses,
          expenses: totalExpenses,
        });
      }

      return monthlyData;
    } catch (error) {
      logger.error('Get monthly data service error:', error);
      throw error;
    }
  }

  async getYearlyData(): Promise<YearlyData[]> {
    try {
      const years = await Sale.findAll({
        where: { isActive: true, paymentStatus: 'PAID' },
        attributes: [
          [fn('DISTINCT', fn('DATE_TRUNC', 'year', col('createdAt'))), 'year'],
        ],
        raw: true,
      });

      const yearlyData: YearlyData[] = [];

      for (const yearRow of years as any[]) {
        const year = new Date(yearRow.year).getFullYear();

        const startDate = startOfYear(new Date(year, 0, 1));
        const endDate = endOfYear(new Date(year, 0, 1));

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

        let revenue = 0;
        let cost = 0;

        sales.forEach((sale) => {
          revenue += sale.grandTotal;
          if (sale.product) {
            cost += sale.product.costPrice * sale.quantity;
          }
        });

        const expenses = await Expense.findAll({
          where: {
            isActive: true,
            expenseDate: {
              [Op.between]: [startDate, endDate],
            },
          },
        });

        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        yearlyData.push({
          year,
          revenue,
          cost,
          profit: revenue - cost - totalExpenses,
          expenses: totalExpenses,
        });
      }

      return yearlyData.sort((a, b) => b.year - a.year);
    } catch (error) {
      logger.error('Get yearly data service error:', error);
      throw error;
    }
  }

  async getLowStockProducts(): Promise<any[]> {
    try {
      const products = await Product.findAll({
        where: {
          isActive: true,
          stockQuantity: {
            [Op.lte]: sequelize.col('reorder_level'),
          },
        },
        include: ['category', 'supplier'],
        order: [['stockQuantity', 'ASC']],
        limit: 10,
      });

      return products.map((p) => ({
        productId: p.productId,
        productName: p.productName,
        barcode: p.barcode,
        stockQuantity: p.stockQuantity,
        reorderLevel: p.reorderLevel,
        categoryName: p.category?.categoryName,
        supplierName: p.supplier?.companyName,
      }));
    } catch (error) {
      logger.error('Get low stock products service error:', error);
      throw error;
    }
  }

  async getRecentSales(limit: number = 10): Promise<any[]> {
    try {
      const sales = await Sale.findAll({
        where: { isActive: true, paymentStatus: 'PAID' },
        include: ['user', 'customer', 'product'],
        order: [['createdAt', 'DESC']],
        limit,
      });

      return sales.map((s) => ({
        saleId: s.saleId,
        invoiceNo: s.invoiceNo,
        productName: s.productName,
        quantity: s.quantity,
        grandTotal: s.grandTotal,
        paymentMethod: s.paymentMethod,
        createdAt: s.createdAt,
        cashier: s.user?.fullName,
        customer: s.customer?.fullName,
      }));
    } catch (error) {
      logger.error('Get recent sales service error:', error);
      throw error;
    }
  }
}

export default new DashboardService();
