import Joi from 'joi';

export const createCategorySchema = Joi.object({
  categoryName: Joi.string().min(1).max(100).required(),
  description: Joi.string().allow('').optional(),
  isActive: Joi.boolean().optional(),
});

export const updateCategorySchema = Joi.object({
  categoryName: Joi.string().min(1).max(100).optional(),
  description: Joi.string().allow('').optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const categoryQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
