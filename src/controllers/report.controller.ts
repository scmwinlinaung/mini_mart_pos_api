import { Request, Response } from 'express';
import reportService from '../services/report.service';
import { successResponse, errorResponse } from '../utils/response.util';
import { HTTP_STATUS, ERROR_MESSAGES } from '../constants';
import logger from '../utils/logger.util';

export const getSalesReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Start date and end date are required');
      return;
    }

    const report = await reportService.getSalesReport(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    successResponse(res, report, 'Sales report retrieved successfully');
  } catch (error) {
    logger.error('Get sales report controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getProfitLossReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Start date and end date are required');
      return;
    }

    const report = await reportService.getProfitLossReport(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    successResponse(res, report, 'Profit & Loss report retrieved successfully');
  } catch (error) {
    logger.error('Get profit loss report controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getInventoryReport = async (_req: Request, res: Response): Promise<void> => {
  try {
    const report = await reportService.getInventoryReport();

    successResponse(res, report, 'Inventory report retrieved successfully');
  } catch (error) {
    logger.error('Get inventory report controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getPurchaseReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Start date and end date are required');
      return;
    }

    const report = await reportService.getPurchaseReport(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    successResponse(res, report, 'Purchase report retrieved successfully');
  } catch (error) {
    logger.error('Get purchase report controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getExpenseReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Start date and end date are required');
      return;
    }

    const report = await reportService.getExpenseReport(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    successResponse(res, report, 'Expense report retrieved successfully');
  } catch (error) {
    logger.error('Get expense report controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export const getAllReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      errorResponse(res, HTTP_STATUS.BAD_REQUEST, 'Start date and end date are required');
      return;
    }

    const reports = await reportService.getAllReports(
      new Date(startDate as string),
      new Date(endDate as string),
    );

    successResponse(res, reports, 'All reports retrieved successfully');
  } catch (error) {
    logger.error('Get all reports controller error:', error);
    errorResponse(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, ERROR_MESSAGES.INTERNAL_ERROR);
  }
};

export default {
  getSalesReport,
  getProfitLossReport,
  getInventoryReport,
  getPurchaseReport,
  getExpenseReport,
  getAllReports,
};
