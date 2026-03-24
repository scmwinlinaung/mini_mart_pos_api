import { Op } from 'sequelize';
import { Sale, Product } from '../models';
import sequelize from '../models';
import { SaleCreateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class SaleService {
  async getAllSales(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    startDate?: Date,
    endDate?: Date,
    invoiceNo?: string,
    customerId?: number,
    productId?: number,
    paymentStatus?: string,
  ): Promise<PaginatedResult<Sale>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = { isActive: true };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }

      if (invoiceNo) {
        where.invoiceNo = { [Op.iLike]: `%${invoiceNo}%` };
      }

      if (customerId) {
        where.customerId = customerId;
      }

      if (productId) {
        where.productId = productId;
      }

      if (paymentStatus) {
        where.paymentStatus = paymentStatus;
      }

      const { count, rows } = await Sale.findAndCountAll({
        where,
        limit,
        offset,
        include: ['user', 'customer', 'product', 'unitType'],
        order: [['createdAt', 'DESC']],
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
      };
    } catch (error) {
      logger.error('Get all sales service error:', error);
      throw error;
    }
  }

  async getSaleById(id: number): Promise<Sale> {
    try {
      const sale = await Sale.findOne({
        where: { saleId: id, isActive: true },
        include: ['user', 'customer', 'product', 'unitType'],
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      return sale;
    } catch (error) {
      logger.error('Get sale by ID service error:', error);
      throw error;
    }
  }

  async createSale(userId: number, data: SaleCreateInput): Promise<Sale> {
    const t = await sequelize.transaction();

    try {
      // Verify product exists and has enough stock
      const product = await Product.findByPk(data.productId, { transaction: t });

      if (!product) {
        throw new Error('Product not found');
      }

      if (product.stockQuantity < data.quantity) {
        throw new Error('Insufficient stock');
      }

      // Create sale
      const sale = await Sale.create({
        invoiceNo: data.invoiceNo,
        userId: userId,
        customerId: data.customerId,
        productId: data.productId,
        unitTypeId: data.unitTypeId,
        barcode: data.barcode,
        productName: data.productName,
        quantity: data.quantity,
        unitPrice: data.unitPrice,
        totalPrice: data.totalPrice,
        taxAmount: data.taxAmount || 0,
        discountAmount: data.discountAmount || 0,
        subTotal: data.subTotal || 0,
        grandTotal: data.grandTotal,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus || 'PAID',
      }, { transaction: t });

      await t.commit();

      logger.info(`Sale created: ${sale.saleId}`);
      return await this.getSaleById(sale.saleId);
    } catch (error) {
      await t.rollback();
      logger.error('Create sale service error:', error);
      throw error;
    }
  }

  async refundSale(id: number, _refundAmount: number,): Promise<Sale> {
    const t = await sequelize.transaction();

    try {
      const sale = await Sale.findOne({
        where: { saleId: id, isActive: true },
        transaction: t,
      });

      if (!sale) {
        throw new Error('Sale not found');
      }

      if (sale.paymentStatus === 'REFUNDED') {
        throw new Error('Sale already refunded');
      }

      // Update sale status (trigger will auto-restore stock and create stock movement)
      await sale.update({
        paymentStatus: 'REFUNDED',
      }, { transaction: t });

      await t.commit();

      logger.info(`Sale refunded: ${id}`);
      return await this.getSaleById(id);
    } catch (error) {
      await t.rollback();
      logger.error('Refund sale service error:', error);
      throw error;
    }
  }

  async getTodaySales(userId?: number): Promise<Sale[]> {
    try {
      const where: any = {
        isActive: true,
        paymentStatus: 'PAID',
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      where.createdAt = {
        [Op.gte]: today,
      };

      if (userId) {
        where.userId = userId;
      }

      const sales = await Sale.findAll({
        where,
        include: ['user', 'customer', 'product'],
        order: [['createdAt', 'DESC']],
      });

      return sales;
    } catch (error) {
      logger.error('Get today sales service error:', error);
      throw error;
    }
  }

  async getSalesSummary(startDate: Date, endDate: Date): Promise<any> {
    try {
      const where = {
        isActive: true,
        paymentStatus: 'PAID',
        createdAt: {
          [Op.between]: [startDate, endDate],
        },
      };

      const sales = await Sale.findAll({
        where,
      });

      const summary = {
        totalRevenue: 0,
        totalSales: sales.length,
        totalItemsSold: 0,
        totalTax: 0,
        totalDiscount: 0,
      };

      sales.forEach((sale) => {
        summary.totalRevenue += sale.grandTotal;
        summary.totalItemsSold += sale.quantity;
        summary.totalTax += sale.taxAmount;
        summary.totalDiscount += sale.discountAmount;
      });

      return summary;
    } catch (error) {
      logger.error('Get sales summary service error:', error);
      throw error;
    }
  }
}

export default new SaleService();
