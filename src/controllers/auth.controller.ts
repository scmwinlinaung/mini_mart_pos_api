import { Request, Response } from 'express';
import authService from '../services/auth.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    successResponse(res, result, 'Login successful', HTTP_STATUS.OK);
  } catch (error: any) {
    logger.error('Login controller error:', error);

    if (error.message === 'Invalid credentials') {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    const tokens = await authService.refreshTokens(refreshToken);

    successResponse(res, tokens, 'Token refreshed successfully', HTTP_STATUS.OK);
  } catch (error: any) {
    logger.error('Refresh token controller error:', error);
    errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.TOKEN_INVALID);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const user = await authService.getUserById(req.user.userId);

    successResponse(res, user, 'User retrieved successfully', HTTP_STATUS.OK);
  } catch (error: any) {
    logger.error('Get me controller error:', error);

    if (error.message === 'User not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const { oldPassword, newPassword } = req.body;

    await authService.changePassword(req.user.userId, oldPassword, newPassword);

    successResponse(res, null, 'Password changed successfully', HTTP_STATUS.OK);
  } catch (error: any) {
    logger.error('Change password controller error:', error);

    if (error.message === 'User not found') {
      errorResponse(res, HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.NOT_FOUND);
      return;
    }

    if (error.message === 'Invalid current password') {
      errorResponse(res, HTTP_STATUS.UNAUTHORIZED, error.message);
      return;
    }

    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // In a stateless JWT system, logout is typically handled on the client side
  // by removing the token. For server-side logout, you'd need a token blacklist.
  // For now, we'll just return success.
  successResponse(res, null, 'Logout successful', HTTP_STATUS.OK);
};

export default {
  login,
  refreshToken,
  getMe,
  changePassword,
  logout,
};
