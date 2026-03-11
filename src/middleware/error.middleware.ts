import { Request, Response, NextFunction } from 'express';
import { ValidationError } from 'sequelize';
import logger from '../utils/logger.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error | AppError | ValidationError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = ERROR_MESSAGES.INTERNAL_ERROR;
  let details: any = undefined;

  // Handle Sequelize validation errors
  if (error instanceof ValidationError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = ERROR_MESSAGES.VALIDATION_ERROR;
    details = error.errors.map((err) => ({
      field: err.path,
      message: err.message,
      type: err.type,
    }));

    logger.warn('Validation error:', details);
  }
  // Handle operational errors
  else if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  }
  // Handle JWT errors
  else if (error.name === 'JsonWebTokenError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.TOKEN_INVALID;
  } else if (error.name === 'TokenExpiredError') {
    statusCode = HTTP_STATUS.UNAUTHORIZED;
    message = ERROR_MESSAGES.TOKEN_EXPIRED;
  }
  // Handle other errors
  else {
    logger.error('Unhandled error:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    error: `Route ${req.method} ${req.url} not found`,
  });
};

export default { AppError, errorHandler, notFoundHandler };
