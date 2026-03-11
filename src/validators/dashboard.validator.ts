import Joi from 'joi';

export const dashboardQuerySchema = Joi.object({
  year: Joi.number().integer().min(2020).max(2100).optional(),
  month: Joi.number().integer().min(1).max(12).optional(),
});
