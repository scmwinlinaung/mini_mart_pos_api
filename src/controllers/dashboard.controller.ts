import { Request, Response } from 'express';
import dashboardService from '../services/dashboard.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.query;
    const summary = await dashboardService.getDashboardSummary(
      year ? Number(year) : undefined,
    );

    successResponse(res, summary, 'Dashboard summary retrieved successfully');
  } catch (error) {
    logger.error('Get dashboard summary controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getMonthlyData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { year } = req.query;

    if (!year) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Year parameter is required');
      return;
    }

    const data = await dashboardService.getMonthlyData(Number(year));

    successResponse(res, data, 'Monthly data retrieved successfully');
  } catch (error) {
    logger.error('Get monthly data controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getYearlyData = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await dashboardService.getYearlyData();

    successResponse(res, data, 'Yearly data retrieved successfully');
  } catch (error) {
    logger.error('Get yearly data controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getLowStockProducts = async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await dashboardService.getLowStockProducts();

    successResponse(res, products, 'Low stock products retrieved successfully');
  } catch (error) {
    logger.error('Get low stock products controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getRecentSales = async (req: Request, res: Response): Promise<void> => {
  try {
    const { limit = 10 } = req.query;
    const sales = await dashboardService.getRecentSales(Number(limit));

    successResponse(res, sales, 'Recent sales retrieved successfully');
  } catch (error) {
    logger.error('Get recent sales controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getDashboardSummary,
  getMonthlyData,
  getYearlyData,
  getLowStockProducts,
  getRecentSales,
};
