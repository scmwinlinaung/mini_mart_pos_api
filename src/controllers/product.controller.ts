import { Request, Response } from 'express';
import productService from '../services/product.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, categoryId, supplierId, isActive, lowStock } = req.query;

    const result = await productService.getAllProducts(
      Number(page),
      Number(limit),
      search as string,
      categoryId ? Number(categoryId) : undefined,
      supplierId ? Number(supplierId) : undefined,
      isActive !== undefined ? isActive === 'true' : undefined,
      lowStock !== undefined ? lowStock === 'true' : undefined,
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get all products controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(Number(id));

    successResponse(res, product, 'Product retrieved successfully');
  } catch (error: any) {
    logger.error('Get product by ID controller error:', error);

    if (error.message === 'Product not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getProductByBarcode = async (req: Request, res: Response): Promise<void> => {
  try {
    const { barcode } = req.params;
    const product = await productService.getProductByBarcode(barcode);

    successResponse(res, product, 'Product retrieved successfully');
  } catch (error: any) {
    logger.error('Get product by barcode controller error:', error);

    if (error.message === 'Product not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const product = await productService.createProduct(data);

    successResponse(res, product, 'Product created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create product controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const product = await productService.updateProduct(Number(id), data);

    successResponse(res, product, 'Product updated successfully');
  } catch (error: any) {
    logger.error('Update product controller error:', error);

    if (error.message === 'Product not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await productService.deleteProduct(Number(id));

    successResponse(res, null, 'Product deleted successfully');
  } catch (error: any) {
    logger.error('Delete product controller error:', error);

    if (error.message === 'Product not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getLowStockProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await productService.getLowStockProducts();

    successResponse(res, products, 'Low stock products retrieved successfully');
  } catch (error) {
    logger.error('Get low stock products controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getInventorySummary = async (_req: Request, res: Response): Promise<void> => {
  try {
    const summary = await productService.getInventorySummary();

    successResponse(res, summary, 'Inventory summary retrieved successfully');
  } catch (error) {
    logger.error('Get inventory summary controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getLowStockProductsPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await productService.getLowStockProductsPaginated(
      Number(page),
      Number(limit),
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get low stock products paginated controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getOutOfStockProductsPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const result = await productService.getOutOfStockProductsPaginated(
      Number(page),
      Number(limit),
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get out of stock products paginated controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const searchProductsPaginated = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 20, supplierId } = req.query;

    // if (!search || typeof search !== 'string') {
    //   errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Search query is required');
    //   return;
    // }

    const result = await productService.searchProductsPaginated(
      search as string,
      Number(page),
      Number(limit),
      Number(supplierId),
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Search products paginated controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getStockMovementHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { limit = 100 } = req.query;

    const stockMovements = await productService.getStockMovementHistory(
      Number(id),
      Number(limit),
    );

    successResponse(res, stockMovements, 'Stock movement history retrieved successfully');
  } catch (error) {
    logger.error('Get stock movement history controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllProducts,
  getProductById,
  getProductByBarcode,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts,
  getInventorySummary,
  getLowStockProductsPaginated,
  getOutOfStockProductsPaginated,
  searchProductsPaginated,
  getStockMovementHistory,
};
