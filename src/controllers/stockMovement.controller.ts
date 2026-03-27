import { Request, Response } from 'express';
import stockMovementService from '../services/stockMovement.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const createManualAdjustment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const data = req.body;

    const stockMovement = await stockMovementService.createManualAdjustment(userId, data);

    successResponse(res, stockMovement, 'Stock adjustment created successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    logger.error('Create manual adjustment controller error:', error);

    if (error.message === 'Product not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    if (error.message.includes('Insufficient stock')) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, error.message);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getStockMovementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const stockMovement = await stockMovementService.getStockMovementById(Number(id));

    successResponse(res, stockMovement, 'Stock movement retrieved successfully');
  } catch (error: any) {
    logger.error('Get stock movement by ID controller error:', error);

    if (error.message === 'Stock movement not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getStockMovements = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      productId,
      movementType,
      startDate,
      endDate,
    } = req.query;

    const filters: any = {
      page: Number(page),
      limit: Number(limit),
    };

    if (productId) filters.productId = Number(productId);
    if (movementType) filters.movementType = movementType as string;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);

    const result = await stockMovementService.getStockMovements(filters);

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get stock movements controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getStockMovementsByProductId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await stockMovementService.getStockMovementsByProductId(
      Number(id),
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
    logger.error('Get stock movements by product ID controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getStockMovementSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, productId } = req.query;

    const summary = await stockMovementService.getStockMovementSummary(
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      Number(productId)
    );

    successResponse(res, summary, 'Stock movement summary retrieved successfully');
  } catch (error) {
    logger.error('Get stock movement summary controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getLossReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      productId,
    } = req.query;

    const filters: any = {
      page: Number(page),
      limit: Number(limit),
    };

    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (productId) filters.productId = Number(productId);

    const result = await stockMovementService.getLossReport(filters);

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get loss report controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  createManualAdjustment,
  getStockMovementById,
  getStockMovements,
  getStockMovementsByProductId,
  getStockMovementSummary,
  getLossReport,
};
