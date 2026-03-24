import { Op } from 'sequelize';
import { Supplier } from '../models';
import { SupplierCreateInput, SupplierUpdateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class SupplierService {
  async getAllSuppliers(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedResult<Supplier>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where[Op.or] = [
          { companyName: { [Op.iLike]: `%${search}%` } },
          { contactName: { [Op.iLike]: `%${search}%` } },
          { phoneNumber: { [Op.iLike]: `%${search}%` } },
        ];
      }
      console.log("isActive = " + isActive)
      if (isActive !== undefined) {
        where.isActive = isActive;
      } else {
        where.isActive = true;
      }

      const { count, rows } = await Supplier.findAndCountAll({
        where,
        limit,
        offset,
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
      logger.error('Get all suppliers service error:', error);
      throw error;
    }
  }

  async getSupplierById(id: number): Promise<Supplier> {
    try {
      const supplier = await Supplier.findOne({
        where: { supplierId: id },
      });

      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return supplier;
    } catch (error) {
      logger.error('Get supplier by ID service error:', error);
      throw error;
    }
  }

  async createSupplier(data: SupplierCreateInput): Promise<Supplier> {
    try {
      const supplier = await Supplier.create({
        companyName: data.companyName,
        contactName: data.contactName,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      logger.info(`Supplier created: ${supplier.supplierId}`);
      return supplier;
    } catch (error) {
      logger.error('Create supplier service error:', error);
      throw error;
    }
  }

  async updateSupplier(id: number, data: SupplierUpdateInput): Promise<Supplier> {
    try {
      const supplier = await this.getSupplierById(id);
      await supplier.update(data);

      logger.info(`Supplier updated: ${id}`);
      return supplier;
    } catch (error) {
      logger.error('Update supplier service error:', error);
      throw error;
    }
  }

  async deleteSupplier(id: number): Promise<void> {
    try {
      const supplier = await this.getSupplierById(id);
      await supplier.update({ isActive: false });

      logger.info(`Supplier deleted: ${id}`);
    } catch (error) {
      logger.error('Delete supplier service error:', error);
      throw error;
    }
  }
}

export default new SupplierService();
