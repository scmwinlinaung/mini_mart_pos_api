import { Op } from 'sequelize';
import { StockMovement, Product } from '../models';
import sequelize from '../models';
import { PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

interface StockMovementCreateInput {
  productId: number;
  movementType: 'SALE' | 'PURCHASE' | 'RETURN' | 'RETURN_IN' | 'RETURN_OUT' | 'DAMAGE' | 'EXPIRED' | 'THEFT' | 'LOSS' | 'CORRECTION';
  quantity: number;
  notes?: string;
}

interface StockMovementFilterOptions {
  page?: number;
  limit?: number;
  productId?: number;
  movementType?: string;
  startDate?: Date;
  endDate?: Date;
}

class StockMovementService {
  async createManualAdjustment(
    userId: number,
    data: StockMovementCreateInput,
  ): Promise<StockMovement> {
    const t = await sequelize.transaction();

    try {
      // Verify product exists
      const product = await Product.findOne({
        where: { productId: data.productId, isActive: true },
        transaction: t,
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Validate quantity based on movement type
      const isNegativeMovement = ['DAMAGE', 'EXPIRED', 'THEFT', 'LOSS', 'RETURN_OUT', 'SALE'].includes(
        data.movementType,
      );
      const isPositiveMovement = ['RETURN_IN', 'CORRECTION', 'PURCHASE'].includes(data.movementType);

      // For negative movements, ensure quantity is negative
      let adjustedQuantity = data.quantity;
      if (isNegativeMovement && data.quantity > 0) {
        adjustedQuantity = -data.quantity;
      }
      // For positive movements, ensure quantity is positive
      else if (isPositiveMovement && data.quantity < 0) {
        adjustedQuantity = Math.abs(data.quantity);
      }

      // Check if sufficient stock for negative movements (except CORRECTION)
      if (
        isNegativeMovement &&
        data.movementType !== 'CORRECTION' &&
        product.stockQuantity < Math.abs(adjustedQuantity)
      ) {
        throw new Error(
          `Insufficient stock. Current stock: ${product.stockQuantity}, Requested: ${Math.abs(adjustedQuantity)}`,
        );
      }

      // Create stock movement record
      const stockMovement = await StockMovement.create({
        productId: data.productId,
        userId: userId,
        movementType: data.movementType,
        quantity: adjustedQuantity,
        notes: data.notes,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }, { transaction: t });

      // Update product stock quantity
      await product.update({
        stockQuantity: product.stockQuantity + adjustedQuantity,
        updatedAt: new Date(),
      }, { transaction: t });

      await t.commit();

      logger.info(
        `Stock movement created: ${stockMovement.movementId}, Type: ${data.movementType}, Qty: ${adjustedQuantity}`,
      );

      return await this.getStockMovementById(stockMovement.movementId);
    } catch (error) {
      await t.rollback();
      logger.error('Create manual stock adjustment service error:', error);
      throw error;
    }
  }

  async getStockMovementById(id: number): Promise<StockMovement> {
    try {
      const stockMovement = await StockMovement.findOne({
        where: { movementId: id, isActive: true },
        include: ['product', 'user'],
      });

      if (!stockMovement) {
        throw new Error('Stock movement not found');
      }

      return stockMovement;
    } catch (error) {
      logger.error('Get stock movement by ID service error:', error);
      throw error;
    }
  }

  async getStockMovements(
    filters: StockMovementFilterOptions = {},
  ): Promise<PaginatedResult<StockMovement>> {
    try {
      const {
        page = 1,
        limit = env.pagination.defaultPageLimit,
        productId,
        movementType,
        startDate,
        endDate,
      } = filters;

      const offset = (page - 1) * limit;

      const where: any = { isActive: true };

      if (productId) {
        where.productId = productId;
      }

      if (movementType) {
        where.movementType = movementType;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }

      const { count, rows } = await StockMovement.findAndCountAll({
        where,
        limit,
        offset,
        include: ['product', 'user'],
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
      logger.error('Get stock movements service error:', error);
      throw error;
    }
  }

  async getStockMovementsByProductId(
    productId: number,
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
  ): Promise<PaginatedResult<StockMovement>> {
    try {
      return await this.getStockMovements({ productId, page, limit });
    } catch (error) {
      logger.error('Get stock movements by product ID service error:', error);
      throw error;
    }
  }

  async getStockMovementSummary(startDate?: Date, endDate?: Date, productId?: number): Promise<any> {
    try {
      const where: any = { isActive: true };

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }
      if (productId) {
        where.productId = productId;
      }

      const movements = await StockMovement.findAll({
        where,
        include: ['product'],
      });

      const summary = {
        totalMovements: movements.length,
        stockIn: 0,
        stockOut: 0,
        netChange: 0,
        byType: {
          SALE: { count: 0, quantity: 0 },
          PURCHASE: { count: 0, quantity: 0 },
          RETURN: { count: 0, quantity: 0 },
          RETURN_IN: { count: 0, quantity: 0 },
          RETURN_OUT: { count: 0, quantity: 0 },
          DAMAGE: { count: 0, quantity: 0 },
          EXPIRED: { count: 0, quantity: 0 },
          THEFT: { count: 0, quantity: 0 },
          LOSS: { count: 0, quantity: 0 },
          CORRECTION: { count: 0, quantity: 0 },
        },
      };

      movements.forEach((movement) => {
        const type = movement.movementType;
        const qty = movement.quantity;

        if (qty > 0) {
          summary.stockIn += qty;
        } else {
          summary.stockOut += Math.abs(qty);
        }

        summary.netChange += qty;

        if (summary.byType[type]) {
          summary.byType[type].count += 1;
          summary.byType[type].quantity += Math.abs(qty);
        }
      });

      return summary;
    } catch (error) {
      logger.error('Get stock movement summary service error:', error);
      throw error;
    }
  }

  async getLossReport(filters: StockMovementFilterOptions = {}): Promise<PaginatedResult<StockMovement> & { summary: any }> {
    try {
      const {
        page = 1,
        limit = env.pagination.defaultPageLimit,
        productId,
        startDate,
        endDate,
      } = filters;

      const offset = (page - 1) * limit;

      const where: any = {
        isActive: true,
        movementType: ['DAMAGE', 'EXPIRED', 'THEFT', 'LOSS'],
      };

      if (productId) {
        where.productId = productId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt[Op.gte] = startDate;
        if (endDate) where.createdAt[Op.lte] = endDate;
      }

      const { count, rows } = await StockMovement.findAndCountAll({
        where,
        limit,
        offset,
        include: ['product', 'user'],
        order: [['createdAt', 'DESC']],
      });

      // Calculate summary from the paginated results
      const summary = {
        totalLoss: 0,
        byType: {
          DAMAGE: { count: 0, quantity: 0, value: 0 },
          EXPIRED: { count: 0, quantity: 0, value: 0 },
          THEFT: { count: 0, quantity: 0, value: 0 },
          LOSS: { count: 0, quantity: 0, value: 0 },
        },
        byProduct: {} as any,
      };

      rows.forEach((movement) => {
        const type = movement.movementType;
        const qty = Math.abs(movement.quantity);
        const value = (movement.product?.costPrice || 0) * qty;

        summary.totalLoss += value;

        if (type in summary.byType) {
          summary.byType[type as keyof typeof summary.byType].count += 1;
          summary.byType[type as keyof typeof summary.byType].quantity += qty;
          summary.byType[type as keyof typeof summary.byType].value += value;
        }

        const productName = movement.product?.productName || 'Unknown';
        if (!summary.byProduct[productName]) {
          summary.byProduct[productName] = {
            productId: movement.productId,
            count: 0,
            quantity: 0,
            value: 0,
          };
        }
        summary.byProduct[productName].count += 1;
        summary.byProduct[productName].quantity += qty;
        summary.byProduct[productName].value += value;
      });

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
        },
        summary,
      };
    } catch (error) {
      logger.error('Get loss report service error:', error);
      throw error;
    }
  }
}

export default new StockMovementService();
