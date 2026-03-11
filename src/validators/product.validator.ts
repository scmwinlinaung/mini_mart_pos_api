import Joi from 'joi';

export const createProductSchema = Joi.object({
  barcode: Joi.string().min(1).max(50).required(),
  productName: Joi.string().min(1).max(50).required(),
  description: Joi.string().optional().allow(''),
  categoryId: Joi.number().integer().positive().required(),
  supplierId: Joi.number().integer().positive().required(),
  unitTypeId: Joi.number().integer().positive().required(),
  costPrice: Joi.number().min(0).required(),
  sellPrice: Joi.number().min(0).required(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  reorderLevel: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
});

export const updateProductSchema = Joi.object({
  barcode: Joi.string().min(1).max(50).optional(),
  productName: Joi.string().min(1).max(50).optional(),
  description: Joi.string().optional().allow(''),
  categoryId: Joi.number().integer().positive().optional(),
  supplierId: Joi.number().integer().positive().optional(),
  unitTypeId: Joi.number().integer().positive().optional(),
  costPrice: Joi.number().min(0).optional(),
  sellPrice: Joi.number().min(0).optional(),
  stockQuantity: Joi.number().integer().min(0).optional(),
  reorderLevel: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const productQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  categoryId: Joi.number().integer().positive().optional(),
  supplierId: Joi.number().integer().positive().optional(),
  isActive: Joi.boolean().optional(),
  lowStock: Joi.boolean().optional(),
});
