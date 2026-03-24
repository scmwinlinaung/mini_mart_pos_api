import { Request, Response } from 'express';
import purchaseService from '../services/purchase.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllPurchases = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, startDate, endDate, supplierId, status } = req.query;

    const result = await purchaseService.getAllPurchases(
      Number(page),
      Number(limit),
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
      supplierId ? Number(supplierId) : undefined,
      status as string,
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get all purchases controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getPurchaseById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const purchase = await purchaseService.getPurchaseById(Number(id));

    successResponse(res, purchase, 'Purchase retrieved successfully');
  } catch (error: any) {
    logger.error('Get purchase by ID controller error:', error);

    if (error.message === 'Purchase not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createPurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const data = req.body;
    const purchase = await purchaseService.createPurchase(req.user.userId, data);

    successResponse(res, purchase, 'Purchase created successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    logger.error('Create purchase controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updatePurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const { id } = req.params;
    const { status } = req.body;
    const purchase = await purchaseService.updatePurchase(Number(id), status);

    successResponse(res, purchase, 'Purchase updated successfully');
  } catch (error: any) {
    logger.error('Update purchase controller error:', error);

    if (error.message === 'Purchase not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deletePurchase = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await purchaseService.deletePurchase(Number(id));

    successResponse(res, null, 'Purchase deleted successfully');
  } catch (error: any) {
    logger.error('Delete purchase controller error:', error);

    if (error.message === 'Purchase not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllPurchases,
  getPurchaseById,
  createPurchase,
  updatePurchase,
  deletePurchase,
};
