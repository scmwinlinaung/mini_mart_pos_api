import { Request, Response } from 'express';
import saleService from '../services/sale.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, startDate, endDate, invoiceNo, customerId, productId, paymentStatus } = req.query;

    const result = await saleService.getAllSales(
      Number(page),
      Number(limit),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      invoiceNo as string,
      customerId ? Number(customerId) : undefined,
      productId ? Number(productId) : undefined,
      paymentStatus as string,
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get all sales controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getSaleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const sale = await saleService.getSaleById(Number(id));

    successResponse(res, sale, 'Sale retrieved successfully');
  } catch (error: any) {
    logger.error('Get sale by ID controller error:', error);

    if (error.message === 'Sale not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createSale = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const data = req.body;
    const sale = await saleService.createSale(req.user.userId, data);

    successResponse(res, sale, 'Sale created successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    logger.error('Create sale controller error:', error);

    if (error.message === 'Product not found' || error.message === 'Insufficient stock') {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, error.message);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const refundSale = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    const { items } = req.body;

    // Support both old API (single saleId + refundAmount) and new API (items array)
    let result;
    if (items && Array.isArray(items)) {
      // New API: Item-level refunds
      // items = [{ saleId: 123, quantity: 2 }, { saleId: 124, quantity: 1 }]
      result = await saleService.refundSale(
        items.map(item => item.saleId),
        items,
      );
    } else {
      // Old API: Backward compatibility - refund entire sale
      result = await saleService.refundSale(Number(id));
    }

    successResponse(res, result, 'Sale refunded successfully');
  } catch (error: any) {
    logger.error('Refund sale controller error:', error);

    if (error.message === 'Sale not found' || error.message === 'Sale already refunded') {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, error.message);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getTodaySales = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const sales = await saleService.getTodaySales(req.user.userId);

    successResponse(res, sales, 'Today sales retrieved successfully');
  } catch (error) {
    logger.error('Get today sales controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getSalesSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Start date and end date are required');
      return;
    }

    const summary = await saleService.getSalesSummary(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    successResponse(res, summary, 'Sales summary retrieved successfully');
  } catch (error) {
    logger.error('Get sales summary controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllSales,
  getSaleById,
  createSale,
  refundSale,
  getTodaySales,
  getSalesSummary,
};
