import { Request, Response } from 'express';
import customerService from '../services/customer.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const result = await customerService.getAllCustomers(
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
    logger.error('Get all customers controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const customer = await customerService.getCustomerById(Number(id));

    successResponse(res, customer, 'Customer retrieved successfully');
  } catch (error: any) {
    logger.error('Get customer by ID controller error:', error);

    if (error.message === 'Customer not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getCustomerByPhoneNumber = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneNumber } = req.params;
    const customer = await customerService.getCustomerByPhoneNumber(phoneNumber);

    successResponse(res, customer, 'Customer retrieved successfully');
  } catch (error: any) {
    logger.error('Get customer by phone number controller error:', error);

    if (error.message === 'Customer not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const customer = await customerService.createCustomer(data);

    successResponse(res, customer, 'Customer created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create customer controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const customer = await customerService.updateCustomer(Number(id), data);

    successResponse(res, customer, 'Customer updated successfully');
  } catch (error: any) {
    logger.error('Update customer controller error:', error);

    if (error.message === 'Customer not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await customerService.deleteCustomer(Number(id));

    successResponse(res, null, 'Customer deleted successfully');
  } catch (error: any) {
    logger.error('Delete customer controller error:', error);

    if (error.message === 'Customer not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllCustomers,
  getCustomerById,
  getCustomerByPhoneNumber,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
