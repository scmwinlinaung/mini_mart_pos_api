import { Request, Response } from 'express';
import expenseService from '../services/expense.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllExpenses = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, startDate, endDate, categoryId } = req.query;

    const result = await expenseService.getAllExpenses(
      Number(page),
      Number(limit),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      categoryId ? Number(categoryId) : undefined,
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get all expenses controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getExpenseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const expense = await expenseService.getExpenseById(Number(id));

    successResponse(res, expense, 'Expense retrieved successfully');
  } catch (error: any) {
    logger.error('Get expense by ID controller error:', error);

    if (error.message === 'Expense not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const data = req.body;
    const expense = await expenseService.createExpense(req.user.userId, data);

    successResponse(res, expense, 'Expense created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create expense controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updateExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const expense = await expenseService.updateExpense(Number(id), data);

    successResponse(res, expense, 'Expense updated successfully');
  } catch (error: any) {
    logger.error('Update expense controller error:', error);

    if (error.message === 'Expense not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deleteExpense = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await expenseService.deleteExpense(Number(id));

    successResponse(res, null, 'Expense deleted successfully');
  } catch (error: any) {
    logger.error('Delete expense controller error:', error);

    if (error.message === 'Expense not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getExpenseCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await expenseService.getExpenseCategories();

    successResponse(res, categories, 'Expense categories retrieved successfully');
  } catch (error) {
    logger.error('Get expense categories controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getExpensesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Start date and end date are required');
      return;
    }

    const summary = await expenseService.getExpensesSummary(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    successResponse(res, summary, 'Expenses summary retrieved successfully');
  } catch (error) {
    logger.error('Get expenses summary controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  getExpensesSummary,
};
