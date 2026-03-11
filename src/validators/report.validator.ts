import Joi from 'joi';

export const reportParamsSchema = Joi.object({
  reportType: Joi.string().valid('sales', 'purchases', 'expenses', 'profit_loss', 'inventory', 'all').required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  year: Joi.number().integer().min(2020).max(2100).optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
});
