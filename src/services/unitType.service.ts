import { Op } from 'sequelize';
import { UnitType } from '../models';
import { UnitTypeCreateInput, UnitTypeUpdateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class UnitTypeService {
  async getAllUnitTypes(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedResult<UnitType>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where[Op.or] = [
          { unitCode: { [Op.iLike]: `%${search}%` } },
          { unitName: { [Op.iLike]: `%${search}%` } },
        ];
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const { count, rows } = await UnitType.findAndCountAll({
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
      logger.error('Get all unit types service error:', error);
      throw error;
    }
  }

  async getUnitTypeById(id: number): Promise<UnitType> {
    try {
      const unitType = await UnitType.findOne({
        where: { unitId: id },
      });

      if (!unitType) {
        throw new Error('Unit type not found');
      }

      return unitType;
    } catch (error) {
      logger.error('Get unit type by ID service error:', error);
      throw error;
    }
  }

  async createUnitType(data: UnitTypeCreateInput): Promise<UnitType> {
    try {
      const unitType = await UnitType.create({
        unitCode: data.unitCode,
        unitName: data.unitName,
        isWeighted: data.isWeighted !== undefined ? data.isWeighted : false,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      logger.info(`Unit type created: ${unitType.unitId}`);
      return unitType;
    } catch (error) {
      logger.error('Create unit type service error:', error);
      throw error;
    }
  }

  async updateUnitType(id: number, data: UnitTypeUpdateInput): Promise<UnitType> {
    try {
      const unitType = await this.getUnitTypeById(id);
      await unitType.update(data);

      logger.info(`Unit type updated: ${id}`);
      return unitType;
    } catch (error) {
      logger.error('Update unit type service error:', error);
      throw error;
    }
  }

  async deleteUnitType(id: number): Promise<void> {
    try {
      const unitType = await this.getUnitTypeById(id);
      await unitType.update({ isActive: false });

      logger.info(`Unit type deleted: ${id}`);
    } catch (error) {
      logger.error('Delete unit type service error:', error);
      throw error;
    }
  }
}

export default new UnitTypeService();
