import { Request, Response } from 'express';
import supplierService from '../services/supplier.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllSuppliers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const result = await supplierService.getAllSuppliers(
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
    logger.error('Get all suppliers controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getSupplierById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier = await supplierService.getSupplierById(Number(id));

    successResponse(res, supplier, 'Supplier retrieved successfully');
  } catch (error: any) {
    logger.error('Get supplier by ID controller error:', error);

    if (error.message === 'Supplier not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const supplier = await supplierService.createSupplier(data);

    successResponse(res, supplier, 'Supplier created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create supplier controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updateSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const supplier = await supplierService.updateSupplier(Number(id), data);

    successResponse(res, supplier, 'Supplier updated successfully');
  } catch (error: any) {
    logger.error('Update supplier controller error:', error);

    if (error.message === 'Supplier not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deleteSupplier = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await supplierService.deleteSupplier(Number(id));

    successResponse(res, null, 'Supplier deleted successfully');
  } catch (error: any) {
    logger.error('Delete supplier controller error:', error);

    if (error.message === 'Supplier not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
