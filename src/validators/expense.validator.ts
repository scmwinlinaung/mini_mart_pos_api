import Joi from 'joi';

export const createExpenseSchema = Joi.object({
  categoryId: Joi.number().integer().positive().required(),
  title: Joi.string().required(),
  description: Joi.string().optional().allow(''),
  amount: Joi.number().positive().required(),
  expenseDate: Joi.date().optional(),
});

export const updateExpenseSchema = Joi.object({
  categoryId: Joi.number().integer().positive().optional(),
  title: Joi.string().optional(),
  description: Joi.string().optional().allow(''),
  amount: Joi.number().positive().optional(),
  expenseDate: Joi.date().optional(),
}).min(1);

export const expenseQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  categoryId: Joi.number().integer().positive().optional(),
});
