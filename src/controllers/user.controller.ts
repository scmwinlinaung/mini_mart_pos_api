import { Request, Response } from 'express';
import userService from '../services/user.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, search, isActive, roleId } = req.query;

    const result = await userService.getAllUsers(
      Number(page),
      Number(limit),
      search as string,
      isActive !== undefined ? isActive === 'true' : undefined,
      roleId ? Number(roleId) : undefined,
    );

    paginatedResponse(
      res,
      result.data,
      result.pagination.page,
      result.pagination.limit,
      result.pagination.total,
    );
  } catch (error) {
    logger.error('Get all users controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(Number(id));

    successResponse(res, user, 'User retrieved successfully');
  } catch (error: any) {
    logger.error('Get user by ID controller error:', error);

    if (error.message === 'User not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    const user = await userService.createUser(data);

    successResponse(res, user, 'User created successfully', HTTP_STATUS.CREATED);
  } catch (error: any) {
    logger.error('Create user controller error:', error);

    if (error.message === 'Username already exists') {
      errorResponse(res, HTTP_STATUS.CONFLICT, error.message);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body;
    const user = await userService.updateUser(Number(id), data);

    successResponse(res, user, 'User updated successfully');
  } catch (error: any) {
    logger.error('Update user controller error:', error);

    if (error.message === 'User not found' || error.message === 'Username already exists') {
      errorResponse(res, error.message === 'User not found' ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.CONFLICT, error.message);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await userService.deleteUser(Number(id));

    successResponse(res, null, 'User deleted successfully');
  } catch (error: any) {
    logger.error('Delete user controller error:', error);

    if (error.message === 'User not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getRoles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const roles = await userService.getRoles();

    successResponse(res, roles, 'Roles retrieved successfully');
  } catch (error) {
    logger.error('Get roles controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const changePasswordSelf = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const { oldPassword, newPassword } = req.body;
    await userService.changePassword(req.user.userId, oldPassword, newPassword);

    successResponse(res, null, 'Password changed successfully');
  } catch (error: any) {
    logger.error('Change password controller error:', error);

    if (error.message === 'User not found' || error.message === 'Invalid current password') {
      errorResponse(res, error.message === 'User not found' ? HTTP_STATUS.NOT_FOUND : HTTP_STATUS.UNAUTHORIZED, error.message);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
  changePasswordSelf,
};
