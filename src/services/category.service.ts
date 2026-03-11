import { Op } from 'sequelize';
import { Category } from '../models';
import { CategoryCreateInput, CategoryUpdateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class CategoryService {
  // Get all categories with pagination
  async getAllCategories(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    search?: string,
    isActive?: boolean,
  ): Promise<PaginatedResult<Category>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.categoryName = {
          [Op.iLike]: `%${search}%`,
        };
      }

      if (isActive !== undefined) {
        where.isActive = isActive;
      }

      const { count, rows } = await Category.findAndCountAll({
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
      logger.error('Get all categories service error:', error);
      throw error;
    }
  }

  // Get category by ID
  async getCategoryById(id: number): Promise<Category> {
    try {
      const category = await Category.findOne({
        where: { categoryId: id },
      });

      if (!category) {
        throw new Error('Category not found');
      }

      return category;
    } catch (error) {
      logger.error('Get category by ID service error:', error);
      throw error;
    }
  }

  // Create category
  async createCategory(data: CategoryCreateInput): Promise<Category> {
    try {
      const category = await Category.create({
        categoryName: data.categoryName,
        description: data.description,
        isActive: data.isActive !== undefined ? data.isActive : true,
      });

      logger.info(`Category created: ${category.categoryId}`);
      return category;
    } catch (error) {
      logger.error('Create category service error:', error);
      throw error;
    }
  }

  // Update category
  async updateCategory(id: number, data: CategoryUpdateInput): Promise<Category> {
    try {
      const category = await this.getCategoryById(id);

      await category.update(data);

      logger.info(`Category updated: ${id}`);
      return category;
    } catch (error) {
      logger.error('Update category service error:', error);
      throw error;
    }
  }

  // Delete category (soft delete)
  async deleteCategory(id: number): Promise<void> {
    try {
      const category = await this.getCategoryById(id);

      await category.update({ isActive: false });

      logger.info(`Category deleted: ${id}`);
    } catch (error) {
      logger.error('Delete category service error:', error);
      throw error;
    }
  }

  // Get active categories count
  async getActiveCategoriesCount(): Promise<number> {
    try {
      return await Category.count({
        where: { isActive: true },
      });
    } catch (error) {
      logger.error('Get active categories count service error:', error);
      throw error;
    }
  }
}

export default new CategoryService();
