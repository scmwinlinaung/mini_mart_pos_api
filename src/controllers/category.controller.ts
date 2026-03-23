import { Request, Response } from 'express';
import categoryService from '../services/category.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const result = await categoryService.getAllCategories(
      Number(page),
      Number(limit),
      search as string,
      isActive !== undefined ? isActive === 'true' : undefined,
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get all categories controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getCategoryById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await categoryService.getCategoryById(Number(id));

    successResponse(res, category, 'Category retrieved successfully');
  } catch (error: any) {
    logger.error('Get category by ID controller error:', error);

    if (error.message === 'Category not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const category = await categoryService.createCategory(data);

    successResponse(res, category, 'Category created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create category controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const category = await categoryService.updateCategory(Number(id), data);

    successResponse(res, category, 'Category updated successfully');
  } catch (error: any) {
    logger.error('Update category controller error:', error);

    if (error.message === 'Category not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log("Category id = " + id)
    await categoryService.deleteCategory(Number(id));

    successResponse(res, null, 'Category deleted successfully');
  } catch (error: any) {
    logger.error('Delete category controller error:', error);

    if (error.message === 'Category not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
