import { Op } from 'sequelize';
import { Expense, ExpenseCategory } from '../models';
import { ExpenseCreateInput, ExpenseUpdateInput, PaginatedResult } from '../types';
import env from '../config/env.config';
import logger from '../utils/logger.util';

class ExpenseService {
  async getAllExpenses(
    page: number = 1,
    limit: number = env.pagination.defaultPageLimit,
    startDate?: Date,
    endDate?: Date,
    categoryId?: number,
  ): Promise<PaginatedResult<Expense>> {
    try {
      const offset = (page - 1) * limit;

      const where: any = { isActive: true };

      if (startDate || endDate) {
        where.expenseDate = {};
        if (startDate) where.expenseDate[Op.gte] = startDate;
        if (endDate) where.expenseDate[Op.lte] = endDate;
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      const { count, rows } = await Expense.findAndCountAll({
        where,
        limit,
        offset,
        include: ['category', 'user'],
        order: [['expenseDate', 'DESC']],
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
      logger.error('Get all expenses service error:', error);
      throw error;
    }
  }

  async getExpenseById(id: number): Promise<Expense> {
    try {
      const expense = await Expense.findOne({
        where: { expenseId: id, isActive: true },
        include: ['category', 'user'],
      });

      if (!expense) {
        throw new Error('Expense not found');
      }

      return expense;
    } catch (error) {
      logger.error('Get expense by ID service error:', error);
      throw error;
    }
  }

  async createExpense(userId: number, data: ExpenseCreateInput): Promise<Expense> {
    try {
      const expense = await Expense.create({
        categoryId: data.categoryId,
        userId: userId,
        title: data.title,
        description: data.description,
        amount: data.amount,
        expenseDate: data.expenseDate || new Date(),
      });

      logger.info(`Expense created: ${expense.expenseId}`);
      return await this.getExpenseById(expense.expenseId);
    } catch (error) {
      logger.error('Create expense service error:', error);
      throw error;
    }
  }

  async updateExpense(id: number, data: ExpenseUpdateInput): Promise<Expense> {
    try {
      const expense = await this.getExpenseById(id);
      await expense.update(data);

      logger.info(`Expense updated: ${id}`);
      return await this.getExpenseById(id);
    } catch (error) {
      logger.error('Update expense service error:', error);
      throw error;
    }
  }

  async deleteExpense(id: number): Promise<void> {
    try {
      const expense = await this.getExpenseById(id);
      await expense.update({ isActive: false });

      logger.info(`Expense deleted: ${id}`);
    } catch (error) {
      logger.error('Delete expense service error:', error);
      throw error;
    }
  }

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    try {
      const categories = await ExpenseCategory.findAll({
        where: { isActive: true },
        order: [['categoryId', 'ASC']],
      });

      return categories;
    } catch (error) {
      logger.error('Get expense categories service error:', error);
      throw error;
    }
  }

  async getExpensesSummary(startDate: Date, endDate: Date): Promise<any> {
    try {
      const where = {
        isActive: true,
        expenseDate: {
          [Op.between]: [startDate, endDate],
        },
      };

      const expenses = await Expense.findAll({
        where,
        include: ['category'],
      });

      const summary = {
        totalExpenses: 0,
        byCategory: <any>{},
      };

      expenses.forEach((expense) => {
        summary.totalExpenses += expense.amount;
        const categoryName = expense.category?.categoryName || 'Unknown';

        if (!summary.byCategory[categoryName]) {
          summary.byCategory[categoryName] = 0;
        }
        summary.byCategory[categoryName] += expense.amount;
      });

      return summary;
    } catch (error) {
      logger.error('Get expenses summary service error:', error);
      throw error;
    }
  }
}

export default new ExpenseService();
