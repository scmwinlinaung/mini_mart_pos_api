import { Op } from 'sequelize';
import { Sale, Product, StockMovement } from '../models';
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
  ): Promise<PaginatedResult<any>> {
    try {
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

      // Fetch all matching sales (no limit yet)
      const sales = await Sale.findAll({
        where,
        include: ['user', 'customer', 'product', 'unitType'],
        order: [['createdAt', 'DESC']],
      });

      // Group sales by invoice_no, keeping Sale model structure
      const groupedSales = sales.reduce((acc, sale) => {
        const key = sale.invoiceNo;
        if (!acc[key]) {
          acc[key] = sale.get({ plain: true });
          acc[key].items = [sale.get({ plain: true })];
        } else {
          acc[key].items.push(sale.get({ plain: true }));
        }
        return acc;
      }, {} as Record<string, any>);

      // Add overall_status to each grouped invoice
      Object.values(groupedSales).forEach((group: any) => {
        const paymentStatuses = new Set(group.items.map((item: any) => item.paymentStatus));
        if (paymentStatuses.has('PAID') && paymentStatuses.has('REFUNDED')) {
          group.paymentStatus = 'PARTIAL_REFUND';
        } else if (paymentStatuses.has('REFUNDED')) {
          group.paymentStatus = 'REFUNDED';
        } else {
          group.paymentStatus = 'PAID';
        }
      });

      // Convert to array and paginate
      const groupedArray = Object.values(groupedSales);
      const total = groupedArray.length;
      const offset = (page - 1) * limit;
      const paginatedData = groupedArray.slice(offset, offset + limit);

      return {
        data: paginatedData,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
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

      const paymentStatus = data.paymentStatus || 'PAID';

      // Only check stock for PAID sales
      if (paymentStatus === 'PAID' && product.stockQuantity < data.quantity) {
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
        paymentStatus,
      }, { transaction: t });

      // Deduct stock and create stock movement for PAID sales
      if (paymentStatus === 'PAID') {
        await product.update({
          stockQuantity: product.stockQuantity - data.quantity,
          updatedAt: new Date(),
        }, { transaction: t });

        await StockMovement.create({
          productId: data.productId,
          userId: userId,
          movementType: 'SALE',
          quantity: -data.quantity,
          notes: `Sale ID: ${sale.saleId} - ${data.productName}`,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, { transaction: t });
      }

      await t.commit();

      logger.info(`Sale created: ${sale.saleId}`);
      return await this.getSaleById(sale.saleId);
    } catch (error) {
      await t.rollback();
      logger.error('Create sale service error:', error);
      throw error;
    }
  }

  async refundSale(
    saleIds: number | number[],
    refundItems?: Array<{ saleId: number; quantity: number }>,
  ): Promise<Sale[]> {
    const t = await sequelize.transaction();

    try {
      // Convert single saleId to array
      const ids = Array.isArray(saleIds) ? saleIds : [saleIds];

      // Find all sales to refund
      const sales = await Sale.findAll({
        where: {
          saleId: { [Op.in]: ids },
          isActive: true,
        },
        transaction: t,
      });

      if (sales.length === 0) {
        throw new Error('Sale(s) not found');
      }

      const refundedSales: Sale[] = [];

      // Process each sale item
      for (const sale of sales) {
        if (sale.paymentStatus === 'REFUNDED') {
          logger.warn(`Sale ${sale.saleId} already refunded, skipping`);
          continue;
        }

        // Check if we have a specific quantity to refund (partial refund)
        const refundItem = refundItems?.find(item => item.saleId === sale.saleId);

        if (refundItem && refundItem.quantity < sale.quantity) {
          // Partial refund: Create a new sale record for the remaining quantity
          const remainingQuantity = sale.quantity - refundItem.quantity;
          const remainingTotalPrice = remainingQuantity * sale.unitPrice;
          const remainingSubTotal = remainingTotalPrice + sale.taxAmount - sale.discountAmount;

          // Get product for stock restoration
          const product = await Product.findByPk(sale.productId, { transaction: t });
          if (!product) {
            throw new Error(`Product not found for sale ${sale.saleId}`);
          }

          // Restore stock for the refunded quantity (original quantity)
          await product.update({
            stockQuantity: product.stockQuantity + sale.quantity,
            updatedAt: new Date(),
          }, { transaction: t });

          // Create stock movement for refund
          await StockMovement.create({
            productId: sale.productId,
            userId: sale.userId,
            movementType: 'RETURN',
            quantity: refundItem.quantity,
            notes: `Refund for Sale ID: ${sale.saleId}`,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }, { transaction: t });

          // Update original sale to refunded quantity
          await sale.update({
            quantity: refundItem.quantity,
            totalPrice: refundItem.quantity * sale.unitPrice,
            subTotal: refundItem.quantity * sale.unitPrice + sale.taxAmount - sale.discountAmount,
            grandTotal: refundItem.quantity * sale.unitPrice + sale.taxAmount - sale.discountAmount,
            paymentStatus: 'REFUNDED',
          }, { transaction: t });

          // Create new sale for remaining items (keeps them as PAID)
          const newSale = await Sale.create({
            invoiceNo: sale.invoiceNo,
            userId: sale.userId,
            customerId: sale.customerId,
            productId: sale.productId,
            unitTypeId: sale.unitTypeId,
            barcode: sale.barcode,
            productName: sale.productName,
            quantity: remainingQuantity,
            unitPrice: sale.unitPrice,
            totalPrice: remainingTotalPrice,
            taxAmount: sale.taxAmount * (remainingQuantity / sale.quantity),
            discountAmount: sale.discountAmount * (remainingQuantity / sale.quantity),
            subTotal: remainingSubTotal,
            grandTotal: remainingSubTotal,
            paymentMethod: sale.paymentMethod,
            paymentStatus: 'PAID',
          }, { transaction: t });

          // Deduct stock for the new remaining sale
          await product.update({
            stockQuantity: product.stockQuantity - remainingQuantity,
            updatedAt: new Date(),
          }, { transaction: t });

          logger.info(`Partial refund processed: Sale ${sale.saleId} refunded ${refundItem.quantity}/${sale.quantity} items`);
          refundedSales.push(sale, newSale);
        } else {
          // Full refund: Restore stock and create stock movement
          const product = await Product.findByPk(sale.productId, { transaction: t });
          if (!product) {
            throw new Error(`Product not found for sale ${sale.saleId}`);
          }

          // Restore stock
          await product.update({
            stockQuantity: product.stockQuantity + sale.quantity,
            updatedAt: new Date(),
          }, { transaction: t });

          // Create stock movement for refund
          await StockMovement.create({
            productId: sale.productId,
            userId: sale.userId,
            movementType: 'RETURN',
            quantity: sale.quantity,
            notes: `Refund for Sale ID: ${sale.saleId}`,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }, { transaction: t });

          // Update sale payment status
          await sale.update({
            paymentStatus: 'REFUNDED',
          }, { transaction: t });

          logger.info(`Sale refunded: ${sale.saleId}`);
          refundedSales.push(sale);
        }
      }

      await t.commit();

      // Fetch and return the updated sales
      const results = await Promise.all(
        refundedSales.map(sale =>
          this.getSaleById(sale.saleId).catch(() => sale)
        )
      );

      return results;
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
