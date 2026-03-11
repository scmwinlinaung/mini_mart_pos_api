import { Op } from 'sequelize';
import { Purchase, PurchaseItem, Product, StockMovement } from '../models';
import sequelize from '../models';
import { PurchaseCreateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class PurchaseService {
  async getAllPurchases(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    startDate?: Date,
    endDate?: Date,
    supplierId?: number,
    status?: string,
  ): Promise<PaginatedResult<Purchase>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = { isActive: true };

      if (startDate || endDate) {
        where.purchaseDate = {};
        if (startDate) where.purchaseDate[Op.gte] = startDate;
        if (endDate) where.purchaseDate[Op.lte] = endDate;
      }

      if (supplierId) {
        where.supplierId = supplierId;
      }

      if (status) {
        where.status = status;
      }

      const { count, rows } = await Purchase.findAndCountAll({
        where,
        limit,
        offset,
        include: ['supplier', 'user', { model: PurchaseItem, as: 'items', include: ['product'] }],
        order: [['purchaseDate', 'DESC']],
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
      logger.error('Get all purchases service error:', error);
      throw error;
    }
  }

  async getPurchaseById(id: number): Promise<Purchase> {
    try {
      const purchase = await Purchase.findOne({
        where: { purchaseId: id, isActive: true },
        include: ['supplier', 'user', { model: PurchaseItem, as: 'items', include: ['product'] }],
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      return purchase;
    } catch (error) {
      logger.error('Get purchase by ID service error:', error);
      throw error;
    }
  }

  async createPurchase(userId: number, data: PurchaseCreateInput): Promise<Purchase> {
    const t = await sequelize.transaction();

    try {
      // Calculate total amount
      let totalAmount = 0;
      for (const item of data.items) {
        totalAmount += item.quantity * item.buyPrice;
      }

      // Create purchase
      const purchase = await Purchase.create({
        supplierId: data.supplierId,
        userId: userId,
        supplierInvoiceNo: data.supplierInvoiceNo,
        totalAmount: data.totalAmount || totalAmount,
        status: data.status || 'RECEIVED',
        purchaseDate: data.purchaseDate || new Date(),
      }, { transaction: t });

      // Create purchase items and update product stock
      for (const item of data.items) {
        await PurchaseItem.create({
          purchaseId: purchase.purchaseId,
          productId: item.productId,
          quantity: item.quantity,
          buyPrice: item.buyPrice,
          expiryDate: item.expiryDate,
        }, { transaction: t });

        // If status is RECEIVED, update product stock
        if (purchase.status === 'RECEIVED') {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (product) {
            await product.update({
              stockQuantity: product.stockQuantity + item.quantity,
              costPrice: item.buyPrice,
            }, { transaction: t });

            // Create stock movement record
            await StockMovement.create({
              productId: item.productId,
              userId: userId,
              movementType: 'PURCHASE',
              quantity: item.quantity,
              notes: `Purchase ID: ${purchase.purchaseId}`,
            }, { transaction: t });
          }
        }
      }

      await t.commit();

      logger.info(`Purchase created: ${purchase.purchaseId}`);
      return await this.getPurchaseById(purchase.purchaseId);
    } catch (error) {
      await t.rollback();
      logger.error('Create purchase service error:', error);
      throw error;
    }
  }

  async updatePurchase(id: number, userId: number, status?: string): Promise<Purchase> {
    const t = await sequelize.transaction();

    try {
      const purchase = await Purchase.findOne({
        where: { purchaseId: id, isActive: true },
        include: ['items'],
        transaction: t,
      });

      if (!purchase) {
        throw new Error('Purchase not found');
      }

      // If status is changing to RECEIVED, update stock
      if (status && status === 'RECEIVED' && purchase.status !== 'RECEIVED') {
        for (const item of (purchase as any).items || []) {
          const product = await Product.findByPk(item.productId, { transaction: t });
          if (product) {
            await product.update({
              stockQuantity: product.stockQuantity + item.quantity,
              costPrice: item.buyPrice,
            }, { transaction: t });

            await StockMovement.create({
              productId: item.productId,
              userId: userId,
              movementType: 'PURCHASE',
              quantity: item.quantity,
              notes: `Purchase ID: ${purchase.purchaseId}`,
            }, { transaction: t });
          }
        }
      }

      await purchase.update({ status: status || purchase.status }, { transaction: t });

      await t.commit();

      logger.info(`Purchase updated: ${id}`);
      return await this.getPurchaseById(id);
    } catch (error) {
      await t.rollback();
      logger.error('Update purchase service error:', error);
      throw error;
    }
  }

  async deletePurchase(id: number): Promise<void> {
    try {
      const purchase = await this.getPurchaseById(id);
      await purchase.update({ isActive: false });

      logger.info(`Purchase deleted: ${id}`);
    } catch (error) {
      logger.error('Delete purchase service error:', error);
      throw error;
    }
  }
}

export default new PurchaseService();
