import { Request, Response } from 'express';
import unitTypeService from '../services/unitType.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllUnitTypes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, isActive } = req.query;

    const result = await unitTypeService.getAllUnitTypes(
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
    logger.error('Get all unit types controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getUnitTypeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const unitType = await unitTypeService.getUnitTypeById(Number(id));

    successResponse(res, unitType, 'Unit type retrieved successfully');
  } catch (error: any) {
    logger.error('Get unit type by ID controller error:', error);

    if (error.message === 'Unit type not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createUnitType = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const unitType = await unitTypeService.createUnitType(data);

    successResponse(res, unitType, 'Unit type created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    logger.error('Create unit type controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updateUnitType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const unitType = await unitTypeService.updateUnitType(Number(id), data);

    successResponse(res, unitType, 'Unit type updated successfully');
  } catch (error: any) {
    logger.error('Update unit type controller error:', error);

    if (error.message === 'Unit type not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deleteUnitType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await unitTypeService.deleteUnitType(Number(id));

    successResponse(res, null, 'Unit type deleted successfully');
  } catch (error: any) {
    logger.error('Delete unit type controller error:', error);

    if (error.message === 'Unit type not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllUnitTypes,
  getUnitTypeById,
  createUnitType,
  updateUnitType,
  deleteUnitType,
};
