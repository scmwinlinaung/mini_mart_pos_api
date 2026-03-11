import Joi from 'joi';

export const createUnitTypeSchema = Joi.object({
  unitCode: Joi.string().min(1).max(50).required(),
  unitName: Joi.string().min(1).max(50).required(),
  isWeighted: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
});

export const updateUnitTypeSchema = Joi.object({
  unitCode: Joi.string().min(1).max(50).optional(),
  unitName: Joi.string().min(1).max(50).optional(),
  isWeighted: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const unitTypeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
