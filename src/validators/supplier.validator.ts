import Joi from 'joi';

export const createSupplierSchema = Joi.object({
  companyName: Joi.string().min(1).max(50).required(),
  contactName: Joi.string().max(50).optional().allow(''),
  phoneNumber: Joi.string().max(15).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional(),
});

export const updateSupplierSchema = Joi.object({
  companyName: Joi.string().min(1).max(50).optional(),
  contactName: Joi.string().max(50).optional().allow(''),
  phoneNumber: Joi.string().max(15).optional().allow(''),
  email: Joi.string().email().optional().allow(''),
  address: Joi.string().optional().allow(''),
  isActive: Joi.boolean().optional(),
}).min(1);

export const supplierQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  search: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
