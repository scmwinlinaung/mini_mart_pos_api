import { Response } from 'express';

export interface SuccessResponse {
  success: true;
  data: any;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

export const successResponse = (
  res: Response,
  data: any,
  message?: string,
  statusCode: number = 200,
): Response => {
  const response: SuccessResponse = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  return res.status(statusCode).json(response);
};

export const paginatedResponse = (
  res: Response,
  data: any[],
  page: number,
  limit: number,
  total: number,
  message?: string,
): Response => {
  const response: SuccessResponse = {
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  if (message) {
    response.message = message;
  }

  return res.status(200).json(response);
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  details?: any,
): Response => {
  const response: ErrorResponse = {
    success: false,
    error: message,
  };

  if (details) {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

export const createdResponse = (
  res: Response,
  data: any,
  message: string = 'Resource created successfully',
): Response => {
  return successResponse(res, data, message, 201);
};

export const noContentResponse = (res: Response): Response => {
  return res.status(204).send();
};
