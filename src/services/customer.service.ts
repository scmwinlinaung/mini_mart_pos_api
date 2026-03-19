import { Op } from 'sequelize';
import { Customer } from '../models';
import { CustomerCreateInput, CustomerUpdateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class CustomerService {
  async getAllCustomers(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedResult<Customer>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where[Op.or] = [
          { fullName: { [Op.iLike]: `%${search}%` } },
          { phoneNumber: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const { count, rows } = await Customer.findAndCountAll({
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
      logger.error('Get all customers service error:', error);
      throw error;
    }
  }

  async getCustomerById(id: number): Promise<Customer> {
    try {
      const customer = await Customer.findOne({
        where: { customerId: id },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    } catch (error) {
      logger.error('Get customer by ID service error:', error);
      throw error;
    }
  }

  async getCustomerByPhoneNumber(phoneNumber: string): Promise<Customer> {
    try {
      const customer = await Customer.findOne({
        where: { phoneNumber, isActive: true },
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    } catch (error) {
      logger.error('Get customer by phone number service error:', error);
      throw error;
    }
  }

  async createCustomer(data: CustomerCreateInput): Promise<Customer> {
    try {
      const customer = await Customer.create({
        phoneNumber: data.phoneNumber,
        fullName: data.fullName,
        address: data.address,
        loyaltyPoints: data.loyaltyPoints || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      logger.info(`Customer created: ${customer.customerId}`);
      return customer;
    } catch (error) {
      logger.error('Create customer service error:', error);
      throw error;
    }
  }

  async updateCustomer(id: number, data: CustomerUpdateInput): Promise<Customer> {
    try {
      const customer = await this.getCustomerById(id);
      await customer.update(data);

      logger.info(`Customer updated: ${id}`);
      return customer;
    } catch (error) {
      logger.error('Update customer service error:', error);
      throw error;
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    try {
      const customer = await this.getCustomerById(id);
      await customer.destroy();

      logger.info(`Customer deleted: ${id}`);
    } catch (error) {
      logger.error('Delete customer service error:', error);
      throw error;
    }
  }
}

export default new CustomerService();
