import { Op, col } from 'sequelize';
import { Product, StockMovement, User } from '../models';
import { ProductCreateInput, ProductUpdateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class ProductService {
  async getAllProducts(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    search?: string,
    categoryId?: number,
    supplierId?: number,
    isActive?: boolean,
    lowStock?: boolean,
  ): Promise<PaginatedResult<Product>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where[Op.or] = [
          { productName: { [Op.iLike]: `%${search}%` } },
          { barcode: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (supplierId) {
        where.supplierId = supplierId;
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      if (lowStock) {
        where.stockQuantity = {
          [Op.lte]: col('reorder_level'),
        };
      }

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit,
        offset,
        include: ['category', 'supplier', 'unitType'],
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
      logger.error('Get all products service error:', error);
      throw error;
    }
  }

  async getProductById(id: number): Promise<Product> {
    try {
      const product = await Product.findOne({
        where: { productId: id },
        include: ['category', 'supplier', 'unitType'],
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Get product by ID service error:', error);
      throw error;
    }
  }

  async getProductByBarcode(barcode: string): Promise<Product> {
    try {
      const product = await Product.findOne({
        where: { barcode, isActive: true },
        include: ['category', 'supplier', 'unitType'],
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Get product by barcode service error:', error);
      throw error;
    }
  }

  async createProduct(data: ProductCreateInput): Promise<Product> {
    try {
      const product = await Product.create({
        barcode: data.barcode,
        productName: data.productName,
        description: data.description,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        unitTypeId: data.unitTypeId,
        costPrice: data.costPrice,
        sellPrice: data.sellPrice,
        stockQuantity: data.stockQuantity || 0,
        reorderLevel: data.reorderLevel || 10,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      logger.info(`Product created: ${product.productId}`);
      return await this.getProductById(product.productId);
    } catch (error) {
      logger.error('Create product service error:', error);
      throw error;
    }
  }

  async updateProduct(id: number, data: ProductUpdateInput): Promise<Product> {
    try {
      const product = await this.getProductById(id);
      await product.update(data);

      logger.info(`Product updated: ${id}`);
      return await this.getProductById(id);
    } catch (error) {
      logger.error('Update product service error:', error);
      throw error;
    }
  }

  async deleteProduct(id: number): Promise<void> {
    try {
      const product = await this.getProductById(id);
      await product.update({ isActive: false });

      logger.info(`Product deleted: ${id}`);
    } catch (error) {
      logger.error('Delete product service error:', error);
      throw error;
    }
  }

  async getLowStockProducts(): Promise<Product[]> {
    try {
      const products = await Product.findAll({
        where: {
          isActive: true,
          stockQuantity: {
            [Op.lte]: col('reorder_level'),
          },
        },
        include: ['category', 'supplier'],
        order: [['stockQuantity', 'ASC']],
      });

      return products;
    } catch (error) {
      logger.error('Get low stock products service error:', error);
      throw error;
    }
  }

  async getInventorySummary(): Promise<{
    totalProducts: number;
    outOfStock: number;
    lowStock: number;
    activeProducts: number;
  }> {
    try {
      const [totalProducts, outOfStock, lowStock, activeProducts] = await Promise.all([
        Product.count(),
        Product.count({
          where: {
            stockQuantity: {
              [Op.lte]: 0,
            },
          },
        }),
        Product.count({
          where: {
            stockQuantity: {
              [Op.gt]: 0,
              [Op.lte]: col('reorder_level'),
            },
          },
        }),
        Product.count({
          where: {
            isActive: true,
          },
        }),
      ]);

      return {
        totalProducts,
        outOfStock,
        lowStock,
        activeProducts,
      };
    } catch (error) {
      logger.error('Get inventory summary service error:', error);
      throw error;
    }
  }

  async getLowStockProductsPaginated(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
  ): Promise<PaginatedResult<Product>> {
    try {
      const offset = (page - 1) * limit;

      const where = {
        isActive: true,
        stockQuantity: {
          [Op.gt]: 0,
          [Op.lte]: col('reorder_level'),
        },
      };

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit,
        offset,
        include: ['category', 'supplier', 'unitType'],
        order: [['stockQuantity', 'ASC'], ['productName', 'ASC']],
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
      logger.error('Get low stock products paginated service error:', error);
      throw error;
    }
  }

  async getOutOfStockProductsPaginated(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
  ): Promise<PaginatedResult<Product>> {
    try {
      const offset = (page - 1) * limit;

      const where = {
        isActive: true,
        stockQuantity: {
          [Op.lte]: 0,
        },
      };

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit,
        offset,
        include: ['category', 'supplier', 'unitType'],
        order: [['productName', 'ASC']],
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
      logger.error('Get out of stock products paginated service error:', error);
      throw error;
    }
  }

  async searchProductsPaginated(
    search: string,
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
  ): Promise<PaginatedResult<Product>> {
    try {
      const offset = (page - 1) * limit;

      const where = {
        isActive: true,
        [Op.or]: [
          { productName: { [Op.iLike]: `%${search}%` } },
          { barcode: { [Op.iLike]: `%${search}%` } },
        ],
      };

      const { count, rows } = await Product.findAndCountAll({
        where,
        limit,
        offset,
        include: ['category', 'supplier', 'unitType'],
        order: [['productName', 'ASC']],
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
      logger.error('Search products paginated service error:', error);
      throw error;
    }
  }

  async getStockMovementHistory(
    productId: number,
    limit: number = 100,
  ): Promise<StockMovement[]> {
    try {
      const stockMovements = await StockMovement.findAll({
        where: {
          productId,
          isActive: true,
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['userId', 'username', 'fullName'],
          },
        ],
        limit,
        order: [['createdAt', 'DESC']],
      });

      return stockMovements;
    } catch (error) {
      logger.error('Get stock movement history service error:', error);
      throw error;
    }
  }
}

export default new ProductService();
